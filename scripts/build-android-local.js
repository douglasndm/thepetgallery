#!/usr/bin/env node
/**
 * Build Android local "estilo EAS", mas com Gradle incremental.
 *
 * Mantém do EAS:
 *  - credentials: baixa a keystore de upload do EAS (credentialsSource: remote)
 *  - env: variáveis do ambiente EAS (production/preview/development) + `env` do eas.json
 *  - versionCode remoto: lê o último do EAS, incrementa (autoIncrement) e grava de volta
 *
 * Diferente do `eas build --local`:
 *  - roda no próprio ./android (não em /tmp), então o Gradle reaproveita o build anterior
 *  - só faz `prebuild --clean` quando o fingerprint nativo muda (ou com --clean)
 *
 * Uso (na pasta do app; o mesmo arquivo serve para qualquer app Expo com eas.json):
 *   node scripts/build-android-local.js --fingerprint   # só imprime o fingerprint nativo (env igual ao build) e sai
 *   node scripts/build-android-local.js [--profile production] [--apk] [--clean]
 *                                       [--skip-install] [--no-increment] [--dry-run]
 *
 * Auth: usa EXPO_TOKEN se existir; senão a sessão do `eas login` (~/.expo/state.json).
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const APP_DIR = path.resolve(__dirname, '..');
// Nome do package.json sem escopo de pacote: "@playtrax/mobile" vira "playtrax-mobile", porque a barra
// criaria uma subpasta inexistente em builds/. Mesma regra do Fastfile.
const APP_NAME = JSON.parse(fs.readFileSync(path.join(APP_DIR, 'package.json'), 'utf8'))
	.name.replace(/^@/, '')
	.replace(/\//g, '-');
const ANDROID_DIR = path.join(APP_DIR, 'android');
const FINGERPRINT_MARKER = path.join(ANDROID_DIR, '.local-build-fingerprint');
const KEYSTORE_PATH = path.join(ANDROID_DIR, 'app', 'eas-local-upload.jks');
const WORKSPACE_ROOT = findWorkspaceRoot(APP_DIR);
const OUTPUT_DIR = path.join(WORKSPACE_ROOT, 'builds');
// Último build bem-sucedido: usado para saber se um OTA ainda é compatível com o nativo publicado.
const LAST_BUILD_FILE = path.join(OUTPUT_DIR, `.${APP_NAME}-android-last-build.json`);
const GRAPHQL_URL = 'https://api.expo.dev/graphql';

// ---------------------------------------------------------------- args
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const option = (name, fallback) => {
	const i = argv.indexOf(`--${name}`);
	if (i !== -1 && argv[i + 1]) return argv[i + 1];
	const eq = argv.find((a) => a.startsWith(`--${name}=`));
	return eq ? eq.split('=').slice(1).join('=') : fallback;
};

const opts = {
	profile: option('profile', 'production'),
	apk: flag('apk'),
	clean: flag('clean'),
	skipInstall: flag('skip-install'),
	noIncrement: flag('no-increment'),
	dryRun: flag('dry-run'),
	fingerprintOnly: flag('fingerprint'),
};

// ---------------------------------------------------------------- helpers
const log = (msg) => console.log(`\n\x1b[36m›\x1b[0m ${msg}`);
const warn = (msg) => console.warn(`\x1b[33m⚠ ${msg}\x1b[0m`);
const fail = (msg) => {
	console.error(`\n\x1b[31m✖ ${msg}\x1b[0m`);
	process.exit(1);
};

function run(cmd, args, { cwd = APP_DIR, capture = false } = {}) {
	const res = spawnSync(cmd, args, {
		cwd,
		env: process.env,
		stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
		encoding: 'utf8',
		maxBuffer: 64 * 1024 * 1024,
	});
	if (res.error) fail(`Falha ao executar ${cmd}: ${res.error.message}`);
	if (res.status !== 0) fail(`${cmd} ${args.join(' ')} saiu com código ${res.status}`);
	return capture ? res.stdout : '';
}

function resolveProfile(easJson, name, seen = new Set()) {
	const profile = easJson.build?.[name];
	if (!profile) fail(`Profile "${name}" não existe no eas.json`);
	if (seen.has(name)) fail(`Ciclo de "extends" no eas.json (${name})`);
	seen.add(name);
	if (!profile.extends) return { ...profile };
	const base = resolveProfile(easJson, profile.extends, seen);
	return {
		...base,
		...profile,
		env: { ...(base.env || {}), ...(profile.env || {}) },
		android: { ...(base.android || {}), ...(profile.android || {}) },
	};
}

function getAuthHeaders() {
	if (process.env.EXPO_TOKEN) return { authorization: `Bearer ${process.env.EXPO_TOKEN}` };
	const statePath = path.join(os.homedir(), '.expo', 'state.json');
	try {
		const secret = JSON.parse(fs.readFileSync(statePath, 'utf8'))?.auth?.sessionSecret;
		if (secret) return { 'expo-session': secret };
	} catch {
		// cai no erro abaixo
	}
	fail('Não encontrei login do Expo. Rode `eas login` ou defina EXPO_TOKEN.');
}

async function gql(query, variables, { retries = 3 } = {}) {
	let res;
	for (let attempt = 1; ; attempt++) {
		try {
			res = await fetch(GRAPHQL_URL, {
				method: 'POST',
				headers: { 'content-type': 'application/json', ...getAuthHeaders() },
				body: JSON.stringify({ query, variables }),
			});
			break;
		} catch (err) {
			// Depois de minutos de Gradle, a conexão keep-alive aberta antes do build pode ter sido
			// fechada pelo servidor ("fetch failed" / "other side closed"). Nova tentativa abre outra.
			const cause = err.cause?.code || err.cause?.message || err.message;
			if (attempt >= retries) throw new Error(`EAS API inacessível (${cause})`);
			warn(`Falha de rede na EAS API (${cause}); tentando de novo (${attempt}/${retries - 1})...`);
			await new Promise((r) => setTimeout(r, 1000 * attempt));
		}
	}
	const body = await res.json().catch(() => null);
	if (!res.ok || !body || body.errors?.length) {
		const detail = body?.errors?.map((e) => e.message).join('; ') || `HTTP ${res.status}`;
		throw new Error(`EAS API: ${detail}`);
	}
	return body.data;
}

// Lê do .env.local/.env APENAS as variáveis pedidas (usado para os "Secret" do EAS,
// que não podem ser baixados). O resto do .env continua ignorado.
function readFromDotenvFiles(names) {
	const found = {};
	for (const file of ['.env.local', '.env']) {
		const full = path.join(APP_DIR, file);
		if (!fs.existsSync(full)) continue;
		for (const line of fs.readFileSync(full, 'utf8').split(/\r?\n/)) {
			const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
			if (!m || !names.includes(m[1]) || m[1] in found) continue;
			let value = m[2];
			if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
			found[m[1]] = { value, file };
		}
	}
	return found;
}

const normalizeFingerprint = (s) => (s || '').replace(/[^0-9a-f]/gi, '').toLowerCase();

// Raiz do workspace: primeira pasta (a partir do app) com lockfile. No monorepo é a raiz dele;
// num app isolado é a própria pasta do app.
function findWorkspaceRoot(start) {
	const lockfiles = ['pnpm-lock.yaml', 'yarn.lock', 'package-lock.json', 'bun.lock', 'bun.lockb'];
	for (let dir = start; ; dir = path.dirname(dir)) {
		if (lockfiles.some((f) => fs.existsSync(path.join(dir, f)))) return dir;
		if (path.dirname(dir) === dir) return start;
	}
}

// Mesmo critério do EAS: um arquivo só entra no build se o .easignore não o excluir. O EAS usa o
// .easignore da raiz do projeto enviado (no monorepo, a raiz dele), então vale o mais próximo subindo
// do app até o workspace. Suporta o básico do gitignore: `*`, `?`, `/` e negação com `!`.
function easIgnores(fileName) {
	let dir = APP_DIR;
	while (!fs.existsSync(path.join(dir, '.easignore')) && dir !== WORKSPACE_ROOT && path.dirname(dir) !== dir) {
		dir = path.dirname(dir);
	}
	const file = path.join(dir, '.easignore');
	if (!fs.existsSync(file)) return false;
	const relative = path.relative(dir, path.join(APP_DIR, fileName)).split(path.sep).join('/');
	const toRegex = (glob) =>
		new RegExp(`^${glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]')}$`);
	let ignored = false;
	for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
		let line = raw.trim();
		if (!line || line.startsWith('#')) continue;
		const negate = line.startsWith('!');
		if (negate) line = line.slice(1);
		const anchored = line.replace(/^\//, '').replace(/\/$/, '');
		// Sem "/" no meio, o padrão vale para o nome em qualquer pasta; com "/", para o caminho a partir da raiz.
		const matches = line.replace(/^\//, '').includes('/') || line.startsWith('/')
			? toRegex(anchored).test(relative)
			: toRegex(anchored).test(fileName);
		if (matches) ignored = !negate;
	}
	return ignored;
}

// No EAS, os .env* enviados com o projeto são lidos pelo Expo sem sobrescrever o que já está no
// ambiente (env do servidor + eas.json). Reproduz isso só com os arquivos que o .easignore deixa passar.
function loadDotenvLikeEas(mode) {
	const loaded = [];
	for (const name of [`.env.${mode}.local`, '.env.local', `.env.${mode}`, '.env']) {
		const full = path.join(APP_DIR, name);
		if (!fs.existsSync(full) || easIgnores(name)) continue;
		let count = 0;
		for (const line of fs.readFileSync(full, 'utf8').split(/\r?\n/)) {
			const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
			if (!m || m[1] in process.env) continue;
			let value = m[2];
			if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
			process.env[m[1]] = value;
			count++;
		}
		loaded.push(`${name} (${count})`);
	}
	return loaded;
}

// ---------------------------------------------------------------- EAS queries
async function fetchEasEnv(appId, environment) {
	const data = await gql(
		`query ($appId: String!, $environment: EnvironmentVariableEnvironment) {
			app { byId(appId: $appId) {
				environmentVariablesIncludingSensitive(environment: $environment) {
					name visibility type
					value(includeFileContent: true)
				}
			} }
		}`,
		{ appId, environment }
	);
	return data.app.byId.environmentVariablesIncludingSensitive ?? [];
}

async function fetchLatestVersion(appId, applicationIdentifier) {
	const data = await gql(
		`query ($appId: String!, $applicationIdentifier: String!) {
			app { byId(appId: $appId) {
				latestAppVersionByPlatformAndApplicationIdentifier(platform: ANDROID, applicationIdentifier: $applicationIdentifier) {
					storeVersion buildVersion
				}
			} }
		}`,
		{ appId, applicationIdentifier }
	);
	return data.app.byId.latestAppVersionByPlatformAndApplicationIdentifier ?? null;
}

async function createAppVersion(input) {
	await gql(
		`mutation ($appVersionInput: AppVersionInput!) {
			appVersion { createAppVersion(appVersionInput: $appVersionInput) { id } }
		}`,
		{ appVersionInput: input }
	);
}

async function fetchKeystore(appId, applicationIdentifier) {
	const data = await gql(
		`query ($appId: String!, $applicationIdentifier: String) {
			app { byId(appId: $appId) {
				androidAppCredentials(filter: { applicationIdentifier: $applicationIdentifier }) {
					androidAppBuildCredentialsList {
						name isDefault
						androidKeystore {
							keystore keystorePassword keyAlias keyPassword
							sha1CertificateFingerprint sha256CertificateFingerprint
						}
					}
				}
			} }
		}`,
		{ appId, applicationIdentifier }
	);
	const list = data.app.byId.androidAppCredentials?.[0]?.androidAppBuildCredentialsList ?? [];
	// Mesma escolha do EAS: as credenciais marcadas como padrão em `eas credentials`.
	const chosen = list.find((c) => c.isDefault) ?? list[0];
	if (!chosen?.androidKeystore) {
		fail(
			`Nenhuma keystore no EAS para ${applicationIdentifier}. Confira com \`eas credentials -p android\`.`
		);
	}
	return { name: chosen.name, ...chosen.androidKeystore };
}

function readLocalCredentials() {
	const file = path.join(APP_DIR, 'credentials.json');
	if (!fs.existsSync(file)) fail('credentialsSource é "local", mas não existe credentials.json');
	const ks = JSON.parse(fs.readFileSync(file, 'utf8')).android?.keystore;
	if (!ks) fail('credentials.json sem android.keystore');
	return {
		name: 'credentials.json',
		keystore: fs.readFileSync(path.resolve(APP_DIR, ks.keystorePath)).toString('base64'),
		keystorePassword: ks.keystorePassword,
		keyAlias: ks.keyAlias,
		keyPassword: ks.keyPassword,
	};
}

// ---------------------------------------------------------------- steps
function fingerprintHash() {
	try {
		const out = run('npx', ['--no-install', 'expo-updates', 'fingerprint:generate', '--platform', 'android', '--workflow', 'managed'], {
			capture: true,
		});
		const json = JSON.parse(out.slice(out.indexOf('{')));
		return json.hash ?? null;
	} catch {
		return null;
	}
}

function patchVersions(versionCode, versionName) {
	const gradleFile = path.join(ANDROID_DIR, 'app', 'build.gradle');
	let src = fs.readFileSync(gradleFile, 'utf8');
	if (!/versionCode\s+\d+/.test(src)) fail('Não achei "versionCode" em android/app/build.gradle');
	src = src.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
	src = src.replace(/versionName\s+"[^"]*"/, `versionName "${versionName}"`);
	fs.writeFileSync(gradleFile, src);
}

function verifySignature(artifact, keystore) {
	const expected = normalizeFingerprint(
		keystore.sha256CertificateFingerprint || keystore.sha1CertificateFingerprint
	);
	if (!expected) {
		warn('EAS não retornou o fingerprint do certificado; pulei a verificação de assinatura.');
		return;
	}
	const res = spawnSync('keytool', ['-printcert', '-jarfile', artifact], { encoding: 'utf8' });
	if (res.status !== 0) {
		warn('Não consegui rodar `keytool -printcert`; verifique a assinatura manualmente.');
		return;
	}
	const algo = keystore.sha256CertificateFingerprint ? 'SHA256' : 'SHA1';
	const match = res.stdout.match(new RegExp(`${algo}:\\s*([0-9A-F:]+)`, 'i'));
	if (!match || normalizeFingerprint(match[1]) !== expected) {
		fail(
			`O artefato NÃO está assinado com a keystore do EAS (${algo} diferente). ` +
				'Não envie esse arquivo para a loja.'
		);
	}
	log(`Assinatura conferida: ${algo} bate com a keystore "${keystore.name}" do EAS.`);
}

// ---------------------------------------------------------------- main
async function main() {
	const easJson = JSON.parse(fs.readFileSync(path.join(APP_DIR, 'eas.json'), 'utf8'));
	const profile = resolveProfile(easJson, opts.profile);
	const versionSource = easJson.cli?.appVersionSource;
	const environment =
		profile.environment ??
		(['production', 'preview', 'development'].includes(opts.profile) ? opts.profile : null);
	if (!environment) fail(`Defina "environment" no profile "${opts.profile}" do eas.json`);

	log(`Profile "${opts.profile}" · ambiente EAS "${environment}"`);

	// Igual ao EAS: o env vem do servidor + eas.json; os .env* só entram se o .easignore deixar
	// (carregados mais abaixo, sem sobrescrever). APP_VARIANT do terminal não vale.
	delete process.env.APP_VARIANT;
	Object.assign(process.env, {
		EXPO_NO_DOTENV: '1',
		EXPO_NO_GIT_STATUS: '1',
		NODE_ENV: 'production',
		...(profile.env || {}),
	});

	if (!opts.skipInstall && !opts.fingerprintOnly) {
		log('pnpm install --frozen-lockfile');
		run('pnpm', ['install', '--frozen-lockfile'], { cwd: WORKSPACE_ROOT });
	}

	log('Lendo app config');
	const exp = JSON.parse(run('npx', ['--no-install', 'expo', 'config', '--json', '--type', 'public'], { capture: true }));
	const appId = exp.extra?.eas?.projectId;
	const applicationId = exp.android?.package;
	if (!appId || !applicationId) fail('Não achei extra.eas.projectId ou android.package no app config');
	log(`Pacote ${applicationId} · APP_VARIANT ${exp.extra?.APP_VARIANT ?? '(não definido)'}`);

	// ---- env do EAS
	log('Baixando variáveis de ambiente do EAS');
	const vars = await fetchEasEnv(appId, environment);
	const envDir = path.join(APP_DIR, '.eas', '.env');
	const missingSecrets = [];
	const easEnv = {};
	const secretNames = vars.filter((v) => v.visibility === 'SECRET' && v.value == null).map((v) => v.name);
	const localSecrets = readFromDotenvFiles(secretNames);
	const secretSources = [];
	for (const v of vars) {
		if (v.visibility === 'SECRET' && v.value == null) {
			if (process.env[v.name] != null) {
				easEnv[v.name] = process.env[v.name];
				secretSources.push(`${v.name} (shell)`);
			} else if (localSecrets[v.name]) {
				easEnv[v.name] = localSecrets[v.name].value;
				secretSources.push(`${v.name} (${localSecrets[v.name].file})`);
			} else {
				missingSecrets.push(v.name);
			}
			continue;
		}
		if (v.type === 'FILE_BASE64') {
			fs.mkdirSync(envDir, { recursive: true });
			const filePath = path.join(envDir, v.name);
			fs.writeFileSync(filePath, Buffer.from(v.value ?? '', 'base64'), { mode: 0o600 });
			easEnv[v.name] = filePath;
		} else {
			easEnv[v.name] = v.value ?? '';
		}
	}
	// Precedência igual à do EAS: env do eas.json vence o env do servidor.
	Object.assign(process.env, easEnv, profile.env || {});
	console.log(`  ${Object.keys(easEnv).length} variáveis carregadas`);
	const dotenvFiles = loadDotenvLikeEas(process.env.NODE_ENV);
	console.log(`  .env enviados ao EAS (não excluídos pelo .easignore): ${dotenvFiles.join(', ') || 'nenhum'}`);
	if (secretSources.length) console.log(`  Secrets do EAS vindos de fonte local: ${secretSources.join(', ')}`);
	if (missingSecrets.length) {
		warn(
			`Secrets do EAS sem valor local (nem no shell, nem no .env.local/.env): ${missingSecrets.join(', ')}. ` +
				'Vão ficar indefinidas nesta build.'
		);
	}

	// Mesmo ambiente do build, então o hash é comparável com o do último build.
	if (opts.fingerprintOnly) {
		const current = fingerprintHash();
		if (!current) fail('Não consegui calcular o fingerprint nativo.');
		console.log(`DEPLOY_FINGERPRINT=${current}`);
		if (fs.existsSync(LAST_BUILD_FILE)) {
			console.log(`DEPLOY_LAST_BUILD=${JSON.stringify(JSON.parse(fs.readFileSync(LAST_BUILD_FILE, 'utf8')))}`);
		}
		return;
	}

	// ---- versão
	let versionCode;
	const versionName = exp.version;
	if (versionSource === 'remote') {
		const latest = await fetchLatestVersion(appId, applicationId);
		if (!latest?.buildVersion) {
			fail('Versão remota não inicializada. Rode `eas build:version:set -p android` uma vez.');
		}
		const current = parseInt(latest.buildVersion, 10);
		versionCode = profile.autoIncrement && !opts.noIncrement ? current + 1 : current;
		log(`versionCode remoto ${current} → build com ${versionCode} (versionName ${versionName})`);
	} else {
		versionCode = exp.android?.versionCode ?? 1;
		log(`appVersionSource local · versionCode ${versionCode}`);
	}

	// ---- credentials
	const keystore =
		profile.credentialsSource === 'local'
			? readLocalCredentials()
			: await fetchKeystore(appId, applicationId);
	log(`Keystore "${keystore.name}" (alias ${keystore.keyAlias})`);

	if (opts.dryRun) {
		log('--dry-run: parei antes do prebuild. Nada foi compilado nem incrementado.');
		return;
	}

	// ---- prebuild (clean só quando o nativo mudou)
	// Atenção: desde o SDK 57 o `expo prebuild` faz clean POR PADRÃO; sem `--no-clean` ele apaga
	// ./android (e todo o estado incremental do Gradle) a cada execução.
	const hash = fingerprintHash();
	const previous = fs.existsSync(FINGERPRINT_MARKER) ? fs.readFileSync(FINGERPRINT_MARKER, 'utf8').trim() : null;
	const needsClean = opts.clean || !fs.existsSync(ANDROID_DIR) || !hash || hash !== previous;
	log(needsClean ? 'expo prebuild --clean (fingerprint nativo mudou ou não havia build anterior)' : 'expo prebuild (fingerprint igual, mantendo ./android e o cache incremental)');
	run('npx', ['--no-install', 'expo', 'prebuild', '--platform', 'android', '--no-install', needsClean ? '--clean' : '--no-clean']);
	if (hash) fs.writeFileSync(FINGERPRINT_MARKER, hash);

	patchVersions(versionCode, versionName);

	// ---- gradle
	fs.writeFileSync(KEYSTORE_PATH, Buffer.from(keystore.keystore, 'base64'), { mode: 0o600 });
	const cleanupKeystore = () => fs.rmSync(KEYSTORE_PATH, { force: true });
	process.on('SIGINT', () => {
		cleanupKeystore();
		process.exit(130);
	});

	const task = opts.apk ? ':app:assembleRelease' : ':app:bundleRelease';
	try {
		// Assinatura injetada (mesmo mecanismo do "Generate Signed Bundle" do Android Studio):
		// sobrescreve o signingConfig do build.gradle sem editar arquivos.
		Object.assign(process.env, {
			'ORG_GRADLE_PROJECT_android.injected.signing.store.file': KEYSTORE_PATH,
			'ORG_GRADLE_PROJECT_android.injected.signing.store.password': keystore.keystorePassword,
			'ORG_GRADLE_PROJECT_android.injected.signing.key.alias': keystore.keyAlias,
			'ORG_GRADLE_PROJECT_android.injected.signing.key.password': keystore.keyPassword,
		});
		log(`./gradlew ${task} --build-cache`);
		run('./gradlew', [task, '--build-cache'], { cwd: ANDROID_DIR });
	} finally {
		cleanupKeystore();
	}

	const built = opts.apk
		? path.join(ANDROID_DIR, 'app/build/outputs/apk/release/app-release.apk')
		: path.join(ANDROID_DIR, 'app/build/outputs/bundle/release/app-release.aab');
	if (!fs.existsSync(built)) fail(`Artefato não encontrado: ${built}`);

	verifySignature(built, keystore);

	fs.mkdirSync(OUTPUT_DIR, { recursive: true });
	const dest = path.join(OUTPUT_DIR, `${APP_NAME}-${versionName}-${versionCode}${path.extname(built)}`);
	fs.copyFileSync(built, dest);
	if (hash) {
		fs.writeFileSync(
			LAST_BUILD_FILE,
			JSON.stringify({ fingerprint: hash, version: versionName, build: String(versionCode), artifact: dest, date: new Date().toISOString() }, null, 2)
		);
	}
	log(`Artefato: ${path.relative(process.cwd(), dest)}`);

	// ---- grava o novo versionCode no EAS (só depois do build dar certo)
	if (versionSource === 'remote' && profile.autoIncrement && !opts.noIncrement) {
		const runtimeVersion =
			typeof exp.runtimeVersion === 'string'
				? exp.runtimeVersion
				: exp.runtimeVersion?.policy === 'appVersion'
					? versionName
					: undefined;
		try {
			await createAppVersion({
			appId,
			platform: 'ANDROID',
			applicationIdentifier: applicationId,
			storeVersion: versionName,
			buildVersion: String(versionCode),
				...(runtimeVersion ? { runtimeVersion } : {}),
			});
		} catch (err) {
			fail(
				`O build está pronto (${path.relative(process.cwd(), dest)}), mas não consegui registrar o versionCode ${versionCode} no EAS: ${err.message}. ` +
					`O EAS continua no ${versionCode - 1}. Antes de enviar este .aab, rode \`eas build:version:set -p android\` e informe ${versionCode}.`
			);
		}
		log(`versionCode ${versionCode} registrado no EAS`);
	}

	if (!opts.apk) {
		console.log(`\nPara enviar: bundle exec fastlane android release aab:${dest}`);
	}
	console.log(`sha256 ${crypto.createHash('sha256').update(fs.readFileSync(dest)).digest('hex')}`);
	// Lidos pelo Deploy Helper: o artefato encadeia o upload; o fingerprint fica no histórico de builds.
	if (hash) console.log(`DEPLOY_FINGERPRINT=${hash}`);
	console.log(`DEPLOY_ARTIFACT=${dest}`);
}

main().catch((err) => fail(err.message));
