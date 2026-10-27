#!/usr/bin/env node
/* global __dirname */
/**
 * Gera as pastas lidas pelo fastlane a partir de listing_texts.js:
 *   store_listing/ios/<locale>/{name,subtitle,keywords,promotional_text,description}.txt
 *   store_listing/android/<locale>/{title,short_description,full_description}.txt
 *
 * Valida os limites das lojas antes de escrever qualquer coisa. As notas de versao (`notes`) nao entram
 * na ficha: ficam em fastlane/metadata, gravadas pelo lane update_patch_notes.
 */
const fs = require('fs');
const path = require('path');

const texts = require('./listing_texts');
const { ios: IOS_LOCALES, android: ANDROID_LOCALES } = require('./locales');

const LIMITS = {
	title: 30,
	sub: 30,
	short: 80,
	kw: 100,
	promo: 170,
	full: 4000,
	notes: 500,
};

const OPTIONAL = ['promo'];

const errors = [];
for (const [locale, fields] of Object.entries(texts)) {
	for (const [field, max] of Object.entries(LIMITS)) {
		const value = fields[field];
		if (!value && OPTIONAL.includes(field)) continue;
		if (!value) errors.push(`${locale}.${field} ausente`);
		else if ([...value].length > max) {
			errors.push(`${locale}.${field}: ${[...value].length} caracteres (max ${max})`);
		}
	}
}
if (errors.length) {
	console.error(`Textos invalidos:\n - ${errors.join('\n - ')}`);
	process.exit(1);
}

const write = (dir, files) => {
	fs.mkdirSync(dir, { recursive: true });
	for (const [name, content] of Object.entries(files)) {
		fs.writeFileSync(path.join(dir, `${name}.txt`), `${content}\n`);
	}
};

fs.rmSync(path.join(__dirname, 'ios'), { recursive: true, force: true });
fs.rmSync(path.join(__dirname, 'android'), { recursive: true, force: true });

for (const [locale, t] of Object.entries(texts)) {
	for (const dir of IOS_LOCALES[locale] || []) {
		write(path.join(__dirname, 'ios', dir), {
			name: t.title,
			subtitle: t.sub,
			keywords: t.kw,
			...(t.promo ? { promotional_text: t.promo } : {}),
			description: t.full,
		});
	}
	for (const dir of ANDROID_LOCALES[locale] || []) {
		write(path.join(__dirname, 'android', dir), {
			title: t.title,
			short_description: t.short,
			full_description: t.full,
		});
	}
}

console.log(`Listing gerado para: ${Object.keys(texts).join(', ')}`);
