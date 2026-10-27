#!/usr/bin/env node
/**
 * Build iOS local "estilo EAS", mas com build incremental do Xcode (+ ccache opcional).
 *
 * Mantém do EAS:
 *  - credentials: baixa certificado de distribuição (.p12) e provisioning profile (App Store) do EAS
 *  - env: variáveis do ambiente EAS (production/preview/development) + `env` do eas.json
 *  - buildNumber remoto: lê o último do EAS, incrementa (autoIncrement) e grava de volta
 *
 * Diferente do `eas build --local`:
 *  - roda no próprio ./ios com DerivedData fixo (ios/build/DerivedData), então o Xcode reaproveita
 *    o build anterior
 *  - só faz `prebuild --clean` quando o fingerprint nativo muda (ou com --clean)
 *  - só roda `pod install` quando Podfile/Podfile.properties.json/lockfile mudam
 *  - se o ccache estiver instalado (`brew install ccache`), os Pods compilam via ccache (USE_CCACHE=1)
 *
 * Uso (na pasta do app; o mesmo arquivo serve para qualquer app Expo com eas.json):
 *   node scripts/build-ios-local.js --fingerprint   # só imprime o fingerprint nativo (env igual ao build) e sai
 *   node scripts/build-ios-local.js [--profile production] [--clean] [--skip-install]
 *                                   [--no-increment] [--no-ccache] [--dry-run]
 *
 * Auth: usa EXPO_TOKEN se existir; senão a sessão do `eas login` (~/.expo/state.json).
 * A keychain temporária e o provisioning profile instalados são removidos ao final, mesmo em erro.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const APP_DIR = path.resolve(__dirname, '..');
const APP_NAME = JSON.parse(fs.readFileSync(path.join(APP_DIR, 'package.json'), 'utf8')).name;
const IOS_DIR = path.join(APP_DIR, 'ios');
const FINGERPRINT_MARKER = path.join(IOS_DIR, '.local-build-fingerprint');
const PODS_MARKER = path.join(IOS_DIR, '.local-build-pods-hash');
const BUILD_DIR = path.join(IOS_DIR, 'build');
const DERIVED_DATA = path.join(BUILD_DIR, 'DerivedData');
const XCODEBUILD_LOG = path.join(BUILD_DIR, 'xcodebuild.log');
const WORKSPACE_ROOT = findWorkspaceRoot(APP_DIR);
const OUTPUT_DIR = path.join(WORKSPACE_ROOT, 'builds');
// Último build bem-sucedido: usado para saber se um OTA ainda é compatível com o nativo publicado.
const LAST_BUILD_FILE = path.join(OUTPUT_DIR, `.${APP_NAME}-ios-last-build.json`);
const GRAPHQL_URL = 'https://api.expo.dev/graphql';
const PROFILE_DIRS = [
	path.join(os.homedir(), 'Library/MobileDevice/Provisioning Profiles'),
	path.join(os.homedir(), 'Library/Developer/Xcode/UserData/Provisioning Profiles'),
];

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
	clean: flag('clean'),
	skipInstall: flag('skip-install'),
	noIncrement: flag('no-increment'),
	noCcache: flag('no-ccache'),
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
const shq = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`;
const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex');

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

// Para comandos com senhas nos argumentos: nunca imprime os argumentos nem a saída.
function runSecret(cmd, args, label) {
	const res = spawnSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
	if (res.error || res.status !== 0) fail(`${label} falhou (${cmd} saiu com código ${res.status ?? res.error?.message}).`);
	return res.stdout;
}

const commandExists = (cmd) => spawnSync('sh', ['-c', `command -v ${cmd}`], { stdio: 'ignore' }).status === 0;

function plistValue(file, keyPath) {
	const res = spawnSync('plutil', ['-extract', keyPath, 'raw', '-o', '-', file], { encoding: 'utf8' });
	return res.status === 0 ? res.stdout.trim() : null;
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
		ios: { ...(base.ios || {}), ...(profile.ios || {}) },
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
			// Depois de minutos de Xcode, a conexão keep-alive aberta antes do build pode ter sido
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
				latestAppVersionByPlatformAndApplicationIdentifier(platform: IOS, applicationIdentifier: $applicationIdentifier) {
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

async function fetchIosCredentials(appId, bundleIdentifier) {
	const data = await gql(
		`query ($appId: String!) {
			app { byId(appId: $appId) {
				iosAppCredentials {
					appleAppIdentifier { bundleIdentifier }
					iosAppBuildCredentialsList(filter: { iosDistributionType: APP_STORE }) {
						distributionCertificate {
							certificateP12 certificatePassword serialNumber validityNotAfter
							appleTeam { appleTeamIdentifier }
						}
						provisioningProfile {
							provisioningProfile developerPortalIdentifier expiration status
							appleTeam { appleTeamIdentifier }
						}
					}
				}
			} }
		}`,
		{ appId }
	);
	const appCreds = (data.app.byId.iosAppCredentials ?? []).find(
		(c) => c.appleAppIdentifier?.bundleIdentifier === bundleIdentifier
	);
	const build = appCreds?.iosAppBuildCredentialsList?.[0];
	if (!build?.distributionCertificate?.certificateP12 || !build?.provisioningProfile?.provisioningProfile) {
		fail(
			`Não há certificado + provisioning profile de App Store no EAS para ${bundleIdentifier}. ` +
				'Confira com `eas credentials -p ios`.'
		);
	}
	const { distributionCertificate: cert, provisioningProfile: profile } = build;
	if (new Date(cert.validityNotAfter) < new Date()) fail(`O certificado de distribuição expirou em ${cert.validityNotAfter}.`);
	if (new Date(profile.expiration) < new Date()) fail(`O provisioning profile expirou em ${profile.expiration}.`);
	return { cert, profile, teamId: profile.appleTeam?.appleTeamIdentifier ?? cert.appleTeam?.appleTeamIdentifier };
}

// ---------------------------------------------------------------- signing (keychain + profile)
const cleanupTasks = [];
process.on('exit', () => {
	for (const task of cleanupTasks.reverse()) {
		try {
			task();
		} catch {
			// melhor esforço
		}
	}
});
process.on('SIGINT', () => process.exit(130));
process.on('SIGTERM', () => process.exit(143));

function setupKeychain(cert) {
	const keychainPath = path.join(os.tmpdir(), `local-build-${crypto.randomUUID()}.keychain-db`);
	const keychainPassword = crypto.randomBytes(24).toString('hex');
	const p12Path = path.join(os.tmpdir(), `local-build-${crypto.randomUUID()}.p12`);

	// Lista de busca atual, para restaurar no final.
	const original = spawnSync('security', ['list-keychains', '-d', 'user'], { encoding: 'utf8' })
		.stdout.split('\n')
		.map((l) => l.trim().replace(/^"|"$/g, ''))
		.filter(Boolean);

	cleanupTasks.push(() => {
		spawnSync('security', ['list-keychains', '-d', 'user', '-s', ...original], { stdio: 'ignore' });
		spawnSync('security', ['delete-keychain', keychainPath], { stdio: 'ignore' });
		fs.rmSync(p12Path, { force: true });
	});

	fs.writeFileSync(p12Path, Buffer.from(cert.certificateP12, 'base64'), { mode: 0o600 });
	runSecret('security', ['create-keychain', '-p', keychainPassword, keychainPath], 'Criar keychain temporária');
	runSecret('security', ['set-keychain-settings', '-lut', '21600', keychainPath], 'Configurar keychain');
	runSecret('security', ['unlock-keychain', '-p', keychainPassword, keychainPath], 'Destravar keychain');
	runSecret(
		'security',
		['import', p12Path, '-P', cert.certificatePassword ?? '', '-A', '-t', 'cert', '-f', 'pkcs12', '-k', keychainPath],
		'Importar certificado de distribuição'
	);
	runSecret(
		'security',
		['set-key-partition-list', '-S', 'apple-tool:,apple:,codesign:', '-s', '-k', keychainPassword, keychainPath],
		'Liberar a chave para o codesign'
	);
	runSecret('security', ['list-keychains', '-d', 'user', '-s', keychainPath, ...original], 'Adicionar keychain à busca');
	fs.rmSync(p12Path, { force: true });
	return keychainPath;
}

function installProvisioningProfile(profile, bundleIdentifier) {
	const raw = Buffer.from(profile.provisioningProfile, 'base64');
	const tmpProfile = path.join(os.tmpdir(), `local-build-${crypto.randomUUID()}.mobileprovision`);
	const tmpPlist = `${tmpProfile}.plist`;
	cleanupTasks.push(() => {
		fs.rmSync(tmpProfile, { force: true });
		fs.rmSync(tmpPlist, { force: true });
	});
	fs.writeFileSync(tmpProfile, raw);
	fs.writeFileSync(tmpPlist, runSecret('security', ['cms', '-D', '-i', tmpProfile], 'Ler provisioning profile'));

	const info = {
		uuid: plistValue(tmpPlist, 'UUID'),
		name: plistValue(tmpPlist, 'Name'),
		teamId: plistValue(tmpPlist, 'TeamIdentifier.0'),
		appId: plistValue(tmpPlist, 'Entitlements.application-identifier'),
	};
	if (!info.uuid || !info.name) fail('Não consegui ler UUID/Name do provisioning profile.');
	if (info.appId && info.appId !== `${info.teamId}.${bundleIdentifier}`) {
		fail(`O provisioning profile é para "${info.appId}", não para ${bundleIdentifier}.`);
	}

	for (const dir of PROFILE_DIRS) {
		fs.mkdirSync(dir, { recursive: true });
		const dest = path.join(dir, `${info.uuid}.mobileprovision`);
		const existed = fs.existsSync(dest);
		fs.writeFileSync(dest, raw);
		if (!existed) cleanupTasks.push(() => fs.rmSync(dest, { force: true }));
	}
	return info;
}

// ---------------------------------------------------------------- steps
function fingerprintHash() {
	try {
		const out = run('npx', ['--no-install', 'expo-updates', 'fingerprint:generate', '--platform', 'ios', '--workflow', 'managed'], {
			capture: true,
		});
		const json = JSON.parse(out.slice(out.indexOf('{')));
		return json.hash ?? null;
	} catch {
		return null;
	}
}

function podsInputHash(useCcache) {
	const parts = ['Podfile', 'Podfile.properties.json'].map((f) => {
		const p = path.join(IOS_DIR, f);
		return fs.existsSync(p) ? fs.readFileSync(p) : '';
	});
	const lock = path.join(WORKSPACE_ROOT, 'pnpm-lock.yaml');
	parts.push(fs.existsSync(lock) ? fs.readFileSync(lock) : '', `ccache=${useCcache ? 1 : 0}`);
	return sha256(Buffer.concat(parts.map((p) => Buffer.from(p))));
}

function findWorkspace() {
	const ws = fs.readdirSync(IOS_DIR).find((f) => f.endsWith('.xcworkspace'));
	if (!ws) fail('Não achei o .xcworkspace em ios/ (o pod install rodou?)');
	return { workspace: path.join(IOS_DIR, ws), scheme: path.basename(ws, '.xcworkspace') };
}

function patchVersions(target, buildNumber, version) {
	const infoPlist = path.join(IOS_DIR, target, 'Info.plist');
	if (!fs.existsSync(infoPlist)) fail(`Não achei ${path.relative(APP_DIR, infoPlist)}`);
	run('/usr/libexec/PlistBuddy', ['-c', `Set :CFBundleVersion ${buildNumber}`, infoPlist]);
	run('/usr/libexec/PlistBuddy', ['-c', `Set :CFBundleShortVersionString ${version}`, infoPlist]);
}

function xcodebuild(args) {
	fs.mkdirSync(BUILD_DIR, { recursive: true });
	const formatter = commandExists('xcbeautify') ? ' | xcbeautify --quiet' : '';
	if (!formatter) console.log('  (dica: `brew install xcbeautify` deixa o log do Xcode legível)');
	const cmd = `set -o pipefail; xcodebuild ${args.map(shq).join(' ')} 2>&1 | tee -a ${shq(XCODEBUILD_LOG)}${formatter}`;
	const res = spawnSync('bash', ['-c', cmd], { cwd: IOS_DIR, env: process.env, stdio: 'inherit' });
	if (res.status !== 0) fail(`xcodebuild falhou. Log completo em ${path.relative(process.cwd(), XCODEBUILD_LOG)}`);
}

function writeExportOptions(file, { teamId, bundleIdentifier, profileUuid }) {
	fs.writeFileSync(
		file,
		`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>method</key><string>app-store-connect</string>
	<key>destination</key><string>export</string>
	<key>signingStyle</key><string>manual</string>
	<key>teamID</key><string>${teamId}</string>
	<key>provisioningProfiles</key>
	<dict>
		<key>${bundleIdentifier}</key><string>${profileUuid}</string>
	</dict>
	<key>manageAppVersionAndBuildNumber</key><false/>
	<key>uploadSymbols</key><true/>
	<key>stripSwiftSymbols</key><true/>
</dict>
</plist>
`
	);
}

function verifyIpa(ipaPath, { profileUuid, teamId }) {
	const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'local-build-ipa-'));
	cleanupTasks.push(() => fs.rmSync(tmp, { recursive: true, force: true }));
	run('unzip', ['-q', ipaPath, '-d', tmp]);
	const payload = path.join(tmp, 'Payload');
	const app = fs.readdirSync(payload).find((f) => f.endsWith('.app'));
	if (!app) fail('IPA sem .app em Payload/');
	const appPath = path.join(payload, app);

	const embeddedPlist = path.join(tmp, 'embedded.plist');
	fs.writeFileSync(
		embeddedPlist,
		runSecret('security', ['cms', '-D', '-i', path.join(appPath, 'embedded.mobileprovision')], 'Ler embedded.mobileprovision')
	);
	if (plistValue(embeddedPlist, 'UUID') !== profileUuid) fail('O IPA não embutiu o provisioning profile do EAS.');

	const verify = spawnSync('codesign', ['--verify', '--deep', '--strict', appPath], { encoding: 'utf8' });
	if (verify.status !== 0) fail(`codesign --verify falhou:\n${verify.stderr}`);
	const details = spawnSync('codesign', ['-dvv', appPath], { encoding: 'utf8' }).stderr;
	if (!details.includes(`TeamIdentifier=${teamId}`)) fail('O IPA não está assinado pelo time esperado.');
	const authority = details.match(/Authority=(.+)/)?.[1] ?? '?';
	const entitlements = spawnSync('codesign', ['-d', '--entitlements', '-', '--xml', appPath], { encoding: 'utf8' }).stdout;
	if (!entitlements.includes('aps-environment')) warn('O IPA assinado não tem "aps-environment": push notifications não vão funcionar.');
	log(`Assinatura conferida: ${authority} · profile ${profileUuid}`);
}

// ---------------------------------------------------------------- main
async function main() {
	if (process.platform !== 'darwin') fail('Build iOS só roda no macOS.');

	const easJson = JSON.parse(fs.readFileSync(path.join(APP_DIR, 'eas.json'), 'utf8'));
	const profile = resolveProfile(easJson, opts.profile);
	const versionSource = easJson.cli?.appVersionSource;
	const environment =
		profile.environment ??
		(['production', 'preview', 'development'].includes(opts.profile) ? opts.profile : null);
	if (!environment) fail(`Defina "environment" no profile "${opts.profile}" do eas.json`);
	if ((profile.distribution ?? 'store') !== 'store') {
		fail(`O profile "${opts.profile}" usa distribution "${profile.distribution}"; este script só gera builds de App Store.`);
	}

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
	const bundleIdentifier = exp.ios?.bundleIdentifier;
	if (!appId || !bundleIdentifier) fail('Não achei extra.eas.projectId ou ios.bundleIdentifier no app config');
	log(`Bundle ${bundleIdentifier} · APP_VARIANT ${exp.extra?.APP_VARIANT ?? '(não definido)'}`);

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
	let buildNumber;
	const version = exp.version;
	if (versionSource === 'remote') {
		const latest = await fetchLatestVersion(appId, bundleIdentifier);
		if (!latest?.buildVersion) {
			fail('Versão remota não inicializada. Rode `eas build:version:set -p ios` uma vez.');
		}
		const current = parseInt(latest.buildVersion, 10);
		if (Number.isNaN(current)) fail(`buildNumber remoto "${latest.buildVersion}" não é inteiro; ajuste com \`eas build:version:set -p ios\`.`);
		buildNumber = profile.autoIncrement && !opts.noIncrement ? current + 1 : current;
		log(`buildNumber remoto ${current} → build com ${buildNumber} (versão ${version})`);
	} else {
		buildNumber = exp.ios?.buildNumber ?? '1';
		log(`appVersionSource local · buildNumber ${buildNumber}`);
	}

	// ---- credentials
	if (profile.credentialsSource === 'local') fail('credentialsSource "local" ainda não é suportado no script iOS.');
	const creds = await fetchIosCredentials(appId, bundleIdentifier);
	log(
		`Certificado ${creds.cert.serialNumber} (vale até ${creds.cert.validityNotAfter.slice(0, 10)}) · ` +
			`profile ${creds.profile.developerPortalIdentifier ?? '?'} (vale até ${creds.profile.expiration.slice(0, 10)}) · time ${creds.teamId}`
	);

	// ---- ccache
	const ccacheInstalled = commandExists('ccache');
	const useCcache = ccacheInstalled && !opts.noCcache;
	if (useCcache) {
		Object.assign(process.env, {
			USE_CCACHE: '1', // lido pelo seu Podfile (ccache_enabled?) no pod install
			CCACHE_MAXSIZE: process.env.CCACHE_MAXSIZE || '20G',
		});
		log(`ccache ativo (${run('ccache', ['--version'], { capture: true }).split('\n')[0]}, máx. ${process.env.CCACHE_MAXSIZE})`);
	} else if (!ccacheInstalled) {
		console.log('  ccache não instalado: `brew install ccache` acelera builds depois de um clean.');
	}

	if (opts.dryRun) {
		log('--dry-run: parei antes do prebuild. Nada foi compilado nem incrementado.');
		return;
	}

	// ---- prebuild (clean só quando o nativo mudou)
	// Atenção: desde o SDK 57 o `expo prebuild` faz clean POR PADRÃO; sem `--no-clean` ele apaga
	// ./ios (Pods, DerivedData em ios/build e todo o estado incremental) a cada execução.
	const hash = fingerprintHash();
	const previous = fs.existsSync(FINGERPRINT_MARKER) ? fs.readFileSync(FINGERPRINT_MARKER, 'utf8').trim() : null;
	const needsClean = opts.clean || !fs.existsSync(IOS_DIR) || !hash || hash !== previous;
	log(needsClean ? 'expo prebuild --clean (fingerprint nativo mudou ou não havia build anterior)' : 'expo prebuild (fingerprint igual, mantendo ./ios e o build incremental)');
	run('npx', ['--no-install', 'expo', 'prebuild', '--platform', 'ios', '--no-install', needsClean ? '--clean' : '--no-clean']);
	if (hash) fs.writeFileSync(FINGERPRINT_MARKER, hash);

	// ---- pods (só quando as entradas mudam)
	const podsHash = podsInputHash(useCcache);
	const podsOk =
		!needsClean &&
		fs.existsSync(path.join(IOS_DIR, 'Pods', 'Manifest.lock')) &&
		fs.existsSync(PODS_MARKER) &&
		fs.readFileSync(PODS_MARKER, 'utf8').trim() === podsHash;
	if (podsOk) {
		log('pod install pulado (Podfile, propriedades e lockfile iguais ao último build)');
	} else {
		log(`pod install${useCcache ? ' (USE_CCACHE=1)' : ''}`);
		run('pod', ['install'], { cwd: IOS_DIR });
		fs.writeFileSync(PODS_MARKER, podsHash);
	}

	const { workspace, scheme } = findWorkspace();
	patchVersions(scheme, buildNumber, version);

	// ---- assinatura: keychain temporária + profile + target em assinatura manual (igual ao EAS)
	const keychainPath = setupKeychain(creds.cert);
	const profileInfo = installProvisioningProfile(creds.profile, bundleIdentifier);
	const teamId = profileInfo.teamId || creds.teamId;
	const configPlugins = require(
		require.resolve('@expo/config-plugins', {
			paths: [path.dirname(require.resolve('expo/package.json', { paths: [APP_DIR] }))],
		})
	);
	configPlugins.IOSConfig.ProvisioningProfile.setProvisioningProfileForPbxproj(APP_DIR, {
		targetName: scheme,
		profileName: profileInfo.name,
		appleTeamId: teamId,
		buildConfiguration: 'Release',
	});
	log(`Profile "${profileInfo.name}" aplicado ao target ${scheme} (Release)`);

	// ---- archive (DerivedData fixo = incremental entre execuções)
	const archivePath = path.join(BUILD_DIR, `${scheme}.xcarchive`);
	const exportPath = path.join(BUILD_DIR, 'export');
	fs.rmSync(archivePath, { recursive: true, force: true });
	fs.rmSync(exportPath, { recursive: true, force: true });
	fs.rmSync(XCODEBUILD_LOG, { force: true });
	if (useCcache) spawnSync('ccache', ['--zero-stats'], { stdio: 'ignore' });

	const started = Date.now();
	log('xcodebuild archive');
	xcodebuild([
		'-workspace', workspace,
		'-scheme', scheme,
		'-configuration', 'Release',
		'-destination', 'generic/platform=iOS',
		'-derivedDataPath', DERIVED_DATA,
		'-archivePath', archivePath,
		'archive',
		`OTHER_CODE_SIGN_FLAGS=--keychain ${keychainPath}`,
	]);
	console.log(`  archive em ${Math.round((Date.now() - started) / 1000)}s`);
	if (useCcache) {
		const stats = spawnSync('ccache', ['--show-stats'], { encoding: 'utf8' }).stdout;
		const hits = stats.split('\n').filter((l) => /hits|misses|Cacheable|Uncacheable/i.test(l));
		console.log(`  ccache:\n    ${hits.map((l) => l.trim()).join('\n    ')}`);
	}

	// ---- export .ipa
	log('xcodebuild -exportArchive');
	const exportOptions = path.join(BUILD_DIR, 'ExportOptions.plist');
	writeExportOptions(exportOptions, { teamId, bundleIdentifier, profileUuid: profileInfo.uuid });
	xcodebuild(['-exportArchive', '-archivePath', archivePath, '-exportPath', exportPath, '-exportOptionsPlist', exportOptions]);

	const ipaName = fs.readdirSync(exportPath).find((f) => f.endsWith('.ipa'));
	if (!ipaName) fail(`Nenhum .ipa em ${exportPath}`);
	const ipa = path.join(exportPath, ipaName);
	verifyIpa(ipa, { profileUuid: profileInfo.uuid, teamId });

	fs.mkdirSync(OUTPUT_DIR, { recursive: true });
	const dest = path.join(OUTPUT_DIR, `${APP_NAME}-${version}-${buildNumber}.ipa`);
	fs.copyFileSync(ipa, dest);
	if (hash) {
		fs.writeFileSync(
			LAST_BUILD_FILE,
			JSON.stringify({ fingerprint: hash, version: version, build: String(buildNumber), artifact: dest, date: new Date().toISOString() }, null, 2)
		);
	}
	log(`Artefato: ${path.relative(process.cwd(), dest)}`);
	console.log(`  dSYMs: ${path.relative(process.cwd(), path.join(archivePath, 'dSYMs'))}`);

	// ---- grava o novo buildNumber no EAS (só depois do build dar certo)
	if (versionSource === 'remote' && profile.autoIncrement && !opts.noIncrement) {
		const runtimeVersion =
			typeof exp.runtimeVersion === 'string'
				? exp.runtimeVersion
				: exp.runtimeVersion?.policy === 'appVersion'
					? version
					: undefined;
		try {
			await createAppVersion({
				appId,
				platform: 'IOS',
				applicationIdentifier: bundleIdentifier,
				storeVersion: version,
				buildVersion: String(buildNumber),
				...(runtimeVersion ? { runtimeVersion } : {}),
			});
		} catch (err) {
			fail(
				`O build está pronto (${path.relative(process.cwd(), dest)}), mas não consegui registrar o buildNumber ${buildNumber} no EAS: ${err.message}. ` +
					`O EAS continua no ${buildNumber - 1}. Antes de enviar este .ipa, rode \`eas build:version:set -p ios\` e informe ${buildNumber}.`
			);
		}
		log(`buildNumber ${buildNumber} registrado no EAS`);
	}

	console.log(`\nPara enviar ao App Store Connect/TestFlight: bundle exec fastlane ios release ipa:${dest}`);
	console.log(`sha256 ${sha256(fs.readFileSync(dest))}`);
	// Lido pelo Deploy Helper para encadear o upload.
	console.log(`DEPLOY_ARTIFACT=${dest}`);
}

main().catch((err) => fail(err.message));
