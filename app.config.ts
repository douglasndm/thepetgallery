import 'tsx/cjs';
import { ExpoConfig, ConfigContext } from 'expo/config';

import pluginsConfigs from './configs/expo/plugins';
import extraConfigs from './configs/expo/extra';
import withReplaceMetaDataResource from './configs/expo/androidManifestReplaceResource';

import { version } from './version.json';

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
			url: 'https://updates.douglasndm.dev/manifest',
			codeSigningMetadata: process.env.DISABLE_CODE_SIGNING
				? undefined
				: { keyid: 'main', alg: 'rsa-v1_5-sha256' },
			codeSigningCertificate: process.env.DISABLE_CODE_SIGNING
				? undefined
				: './certs/certificate.pem',
			enabled: true,
			requestHeaders: {
				'expo-channel-name': process.env.APP_VARIANT ?? 'production',
				'expo-app-id': 'bc10c763-45b8-4802-90ed-c3602dcb2e4e',
			},
		},

		buildCacheProvider: 'eas',
		experiments: {
			typedRoutes: true,
		},
	});
