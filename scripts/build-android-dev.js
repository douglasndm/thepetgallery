#!/usr/bin/env node
/**
 * Build Android de desenvolvimento (Debug): só gera o APK, sem precisar de emulador ou dispositivo.
 *
 * Roda `./gradlew :app:assembleDebug` no ./android que o `prebuild:dev` gerou, copia o APK para
 * `builds/<app>-debug.apk` na raiz do workspace e imprime `DEPLOY_ARTIFACT=<caminho>`.
 * Instalar é um passo à parte (`adb install -r builds/<app>-debug.apk`; o Deploy Helper tem um botão
 * que lista emuladores e dispositivos conectados).
 *
 * Uso (na pasta do app; o mesmo arquivo serve para qualquer app Expo):
 *   node scripts/build-android-dev.js
 *
 * Argumentos extras (ex.: `--no-bundler`, que o Deploy Helper manda para os scripts `*:dev`) são ignorados.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const APP_DIR = path.resolve(__dirname, '..');
// Nome do package.json sem escopo de pacote: "@playtrax/mobile" vira "playtrax-mobile", porque a barra
// criaria uma subpasta inexistente em builds/. Mesma regra dos outros scripts e do Fastfile.
const APP_NAME = JSON.parse(fs.readFileSync(path.join(APP_DIR, 'package.json'), 'utf8'))
	.name.replace(/^@/, '')
	.replace(/\//g, '-');
const ANDROID_DIR = path.join(APP_DIR, 'android');
const OUTPUT_DIR = path.join(findWorkspaceRoot(APP_DIR), 'builds');
const BUILT_APK = path.join(ANDROID_DIR, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

const log = (msg) => console.log(`\n\x1b[36m›\x1b[0m ${msg}`);
const fail = (msg) => {
	console.error(`\n\x1b[31m✖ ${msg}\x1b[0m`);
	process.exit(1);
};

// Raiz do workspace: primeira pasta (a partir do app) com lockfile. No monorepo é a raiz dele;
// num app isolado é a própria pasta do app.
function findWorkspaceRoot(start) {
	const lockfiles = ['pnpm-lock.yaml', 'yarn.lock', 'package-lock.json', 'bun.lock', 'bun.lockb'];
	for (let dir = start; ; dir = path.dirname(dir)) {
		if (lockfiles.some((f) => fs.existsSync(path.join(dir, f)))) return dir;
		if (path.dirname(dir) === dir) return start;
	}
}

if (!fs.existsSync(path.join(ANDROID_DIR, 'gradlew'))) {
	fail('Pasta ./android não encontrada. Rode `prebuild:dev` antes (ou marque "Rodar prebuild:dev antes" no Deploy Helper).');
}

log('./gradlew :app:assembleDebug');
const result = spawnSync('./gradlew', [':app:assembleDebug'], { cwd: ANDROID_DIR, stdio: 'inherit' });
if (result.status !== 0) fail(`O Gradle terminou com código ${result.status ?? result.signal}.`);
if (!fs.existsSync(BUILT_APK)) fail(`APK não encontrado em ${BUILT_APK}.`);

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const dest = path.join(OUTPUT_DIR, `${APP_NAME}-debug.apk`);
fs.copyFileSync(BUILT_APK, dest);

log(`APK debug: ${dest}`);
console.log(`DEPLOY_ARTIFACT=${dest}`);
