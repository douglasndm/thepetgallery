const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

/**
 * Helper to parse a simple .env file into key-value pairs
 */
function parseEnvFile(filePath) {
	if (!fs.existsSync(filePath)) return {};
	const content = fs.readFileSync(filePath, 'utf8');
	const env = {};
	content.split('\n').forEach((line) => {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) return;
		const eqIdx = trimmed.indexOf('=');
		if (eqIdx !== -1) {
			const key = trimmed.substring(0, eqIdx).trim();
			let val = trimmed.substring(eqIdx + 1).trim();
			if (
				(val.startsWith('"') && val.endsWith('"')) ||
				(val.startsWith("'") && val.endsWith("'"))
			) {
				val = val.slice(1, -1);
			}
			env[key] = val;
		}
	});
	return env;
}

function loadEnv() {
	const cwd = process.cwd();
	const envBase = parseEnvFile(path.resolve(cwd, '.env'));
	const envLocal = parseEnvFile(path.resolve(cwd, '.env.local'));
	return { ...envBase, ...envLocal };
}

function run() {
	const loadedEnv = loadEnv();

	const appVariant = process.env.APP_VARIANT || loadedEnv.APP_VARIANT || 'production';
	const eooToken = process.env.EOO_TOKEN || loadedEnv.EOO_TOKEN || '';
	const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN || loadedEnv.SENTRY_AUTH_TOKEN || '';

	// Parse command line arguments for --branch, --message, --no-sourcemap, or positional argument
	const args = process.argv.slice(2);
	let branch = appVariant;
	let message = '';
	let dumpSourcemap = true;
	let disableRepositoryCheck = true;
	const extraArgs = [];

	for (let i = 0; i < args.length; i++) {
		if (args[i] === '--branch' && args[i + 1]) {
			branch = args[i + 1];
			i++;
		} else if (args[i].startsWith('--branch=')) {
			branch = args[i].substring('--branch='.length);
		} else if ((args[i] === '--message' || args[i] === '-m') && args[i + 1]) {
			message = args[i + 1];
			i++;
		} else if (args[i].startsWith('--message=')) {
			message = args[i].substring('--message='.length);
		} else if (args[i].startsWith('-m=')) {
			message = args[i].substring('-m='.length);
		} else if (
			args[i] === '--no-sourcemap' ||
			args[i] === '--noSourcemap' ||
			args[i] === '--skip-sourcemap' ||
			args[i] === '--skipSourcemap' ||
			args[i] === '--no-dump-sourcemap'
		) {
			dumpSourcemap = false;
		} else if (
			args[i] === '--dumpSourcemap' ||
			args[i] === '--dump-sourcemap' ||
			args[i] === '--uploadSourcemaps' ||
			args[i] === '--upload-sourcemaps'
		) {
			dumpSourcemap = true;
		} else if (
			args[i] === '--require-clean-git' ||
			args[i] === '--requireCleanGit' ||
			args[i] === '--enableRepositoryCheck' ||
			args[i] === '--enable-repository-check' ||
			args[i] === '--check-git' ||
			args[i] === '--checkRepository' ||
			args[i] === '--no-disable-repository-check'
		) {
			disableRepositoryCheck = false;
		} else if (
			args[i] === '--disableRepositoryCheck' ||
			args[i] === '--disable-repository-check' ||
			args[i] === '--no-git-check' ||
			args[i] === '--noGitCheck'
		) {
			disableRepositoryCheck = true;
		} else if (args[i].startsWith('-')) {
			extraArgs.push(args[i]);
			if (args[i + 1] && !args[i + 1].startsWith('-')) {
				extraArgs.push(args[i + 1]);
				i++;
			}
		} else {
			branch = args[i];
		}
	}

	if (!message || !message.trim()) {
		console.error(
			'❌ Erro: O parâmetro --message (ou -m) é obrigatório e deve conter o texto do update.',
		);
		console.error('Exemplo: pnpm publish:ota --message "Descrição da atualização"');
		process.exit(1);
	}

	if (!eooToken) {
		console.error('❌ Erro: EOO_TOKEN não foi encontrado no seu arquivo .env ou .env.local.');
		console.error('Adicione "EOO_TOKEN=sua_chave_aqui" no arquivo .env antes de publicar.');
		process.exit(1);
	}

	console.log(`🚀 Preparando publicação OTA via Expo...`);
	console.log(`📌 Branch: ${branch}`);
	console.log(`📌 Release Channel (APP_VARIANT): ${appVariant}`);
	console.log(`📌 Mensagem: ${message}`);
	console.log(`📌 Sourcemaps & Sentry: ${dumpSourcemap ? 'ativado (padrão)' : 'desativado'}`);
	console.log(
		`📌 Checagem de Git limpo: ${disableRepositoryCheck ? 'desativada (padrão)' : 'ativada'}\n`,
	);

	const eoasAllowInsecure =
		process.env.EOAS_ALLOW_INSECURE_UPLOAD_URLS ??
		loadedEnv.EOAS_ALLOW_INSECURE_UPLOAD_URLS ??
		'true';

	// eoas publishes the bundle with EXPO_NO_DOTENV=1 (it does not load .env itself),
	// so every variable must be present in the child process environment for it to be
	// baked into the exported bundle via app.config.ts. Otherwise all `extra` values
	// are empty and the app crashes on startup after the update is applied.
	const env = {
		...process.env,
		...loadedEnv,
		RELEASE_CHANNEL: appVariant,
		EOO_TOKEN: eooToken,
		EOAS_ALLOW_INSECURE_UPLOAD_URLS: eoasAllowInsecure,
	};

	const publishArgs = [
		'--yes',
		'eoas',
		'publish',
		'--branch',
		branch,
		'--message',
		`"${message.replace(/"/g, '\\"')}"`,
		...extraArgs,
	];

	if (disableRepositoryCheck) {
		publishArgs.push('--disableRepositoryCheck');
	}

	if (dumpSourcemap) {
		publishArgs.push('--dumpSourcemap');
	}

	const result = spawnSync('npx', publishArgs, {
		stdio: 'inherit',
		env,
		shell: true,
	});

	if (result.error) {
		console.error('❌ Erro ao executar o comando eoas publish:', result.error);
		process.exit(1);
	}

	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}

	if (dumpSourcemap) {
		if (sentryAuthToken) {
			console.log('\n📤 Enviando sourcemaps para o Sentry...');
			const sentryEnv = {
				...env,
				SENTRY_URL: process.env.SENTRY_URL || loadedEnv.SENTRY_URL,
				SENTRY_ORG: process.env.SENTRY_ORG || loadedEnv.SENTRY_ORG,
				SENTRY_PROJECT: process.env.SENTRY_PROJECT || loadedEnv.SENTRY_PROJECT,
				SENTRY_AUTH_TOKEN: sentryAuthToken,
			};

			const sentryResult = spawnSync(
				'pnpm',
				['exec', 'sentry-expo-upload-sourcemaps', 'dist'],
				{
					stdio: 'inherit',
					env: sentryEnv,
					shell: true,
				},
			);

			if (sentryResult.error) {
				console.error(
					'⚠️ Erro ao executar envio de sourcemaps ao Sentry:',
					sentryResult.error,
				);
			} else if (sentryResult.status === 0) {
				console.log('✅ Sourcemaps enviados com sucesso para o Sentry!');
			} else {
				console.warn('⚠️ O upload de sourcemaps para o Sentry retornou erro.');
			}
		} else {
			console.warn(
				'\n⚠️ Sourcemaps gerados (--dumpSourcemap), mas SENTRY_AUTH_TOKEN não foi encontrado no arquivo .env ou .env.local. O envio para o Sentry foi ignorado.',
			);
		}
	}

	process.exit(0);
}

run();
