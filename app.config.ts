import 'tsx/cjs';
import { ExpoConfig, ConfigContext } from 'expo/config';

import pluginsConfigs from './configs/expo/plugins';
import extraConfigs from './configs/expo/extra';
import withReplaceMetaDataResource from './configs/expo/androidManifestReplaceResource';

import { version } from './package.json';

export default ({ config }: ConfigContext): ExpoConfig =>
	withReplaceMetaDataResource({
		...config,
		name: 'The Pet Gallery',
		slug: 'the-pet-gallery',
		scheme: 'thepetgallery',
		icon: './assets/images/logo/appstore.png',
		orientation: 'portrait',
		version: version,
		runtimeVersion: {
			policy: 'appVersion',
		},
		platforms: ['ios', 'android'],

		android: {
			googleServicesFile:
				process.env.GOOGLE_SERVICES_JSON ??
				'./configs/google-services.json',

			package: 'dev.douglasndm.thepetgallery',
		},
		ios: {
			bundleIdentifier: 'dev.douglasndm.thepetgallery',
			config: {
				usesNonExemptEncryption: false,
			},
			googleServicesFile:
				process.env.GOOGLE_SERVICES_PLIST ??
				'./configs/GoogleService-Info.plist',
			usesAppleSignIn: true,
		},
		locales: {
			en: './src/localization/native/en-US.json',
			pt: './src/localization/native/pt-BR.json',
		},

		plugins: pluginsConfigs,
		extra: extraConfigs,
		updates: {
			url: 'https://u.expo.dev/3ce8ca86-09ca-4432-9f90-0468e97b1684',
		},

		buildCacheProvider: 'eas',
		experiments: {
			typedRoutes: true,
		},
	});
