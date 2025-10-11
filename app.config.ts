import 'tsx/cjs';
import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

import pluginsConfigs from './configs/expo/plugins';
import extraConfigs from './configs/expo/extra';

import { version } from './package.json';

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: 'thepetgallery',
	slug: 'the-pet-gallery',
	icon: './assets/images/Logo/appstore.png',
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
		googleServicesFile:
			process.env.GOOGLE_SERVICES_PLIST ??
			'./configs/GoogleService-Info.plist',
	},

	plugins: pluginsConfigs,
	extra: extraConfigs,

	buildCacheProvider: 'eas',
});
