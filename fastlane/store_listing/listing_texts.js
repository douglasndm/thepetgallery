/**
 * Fonte unica dos textos das lojas (App Store e Google Play). Locales de cada loja: locales.js.
 *
 * A ficha deste app (title, sub, short, kw, full) ainda nao esta aqui: so as notas de versao.
 * Ate preencher, `store:listing` e `upload_listing` param com "ausente" sem enviar nada. Para comecar,
 * baixe o publicado com `store:listing:download:ios` / `:android` (vai para store_listing_current/).
 *
 * Campos: veja deploy-helper/templates/expo-app/fastlane/store_listing/listing_texts.js
 */
module.exports = {
	'pt-BR': { notes: 'Correções de bugs, melhorias de estabilidade e aprimoramentos de desempenho.' },
	'en-US': { notes: 'Bug fixes, stability improvements, and performance enhancements.' },
};
