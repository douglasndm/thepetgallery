/**
 * Chave do listing_texts.js -> pastas de cada loja. Lido pelo generate.js (ficha) e pelo Fastfile (notas).
 *
 * App Store: tem es-ES e es-MX, mas NAO tem es-419.
 * Google Play: tem es-ES e es-419; uma chave pode alimentar mais de uma pasta (ex.: en-GB e en-IN).
 */
module.exports = {
	ios: {
		'pt-BR': ['pt-BR'],
		'en-US': ['en-US'],
	},
	android: {
		'pt-BR': ['pt-BR'],
		'en-US': ['en-US'],
	},
};
