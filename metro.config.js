const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);

config.resolver = {
	...config.resolver,
	assetExts: config.resolver.assetExts
		.filter(ext => ext !== 'svg')
		.concat('lottie'),
	sourceExts: [...config.resolver.sourceExts, 'svg'],
};

module.exports = config;
