import { ExpoConfig } from '@expo/config';
import {
	ConfigPlugin,
	withAndroidManifest,
	AndroidConfig,
} from 'expo/config-plugins';

const withReplaceMetaDataResource: ConfigPlugin = (expoConfig: ExpoConfig) => {
	return withAndroidManifest(expoConfig, androidManifestConfig => {
		const modResults = androidManifestConfig.modResults;
		const manifest = modResults.manifest;

		// Garantir que manifest.$ existe e contém xmlns:android
		if (!manifest.$) {
			manifest.$ = {
				'xmlns:android': 'http://schemas.android.com/apk/res/android',
			};
		} else if (!manifest.$['xmlns:android']) {
			manifest.$['xmlns:android'] =
				'http://schemas.android.com/apk/res/android';
		}

		// Garantir namespace tools
		if (!manifest.$['xmlns:tools']) {
			manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
		}

		// Pegar o elemento <application>
		const mainApp =
			AndroidConfig.Manifest.getMainApplicationOrThrow(modResults);

		// Garantir que meta-data existe
		if (!mainApp['meta-data']) {
			mainApp['meta-data'] = [];
		}

		const nameToReplace =
			'com.google.firebase.messaging.default_notification_color'; // ajuste conforme seu erro
		const resourceValue = '@color/notification_icon_color'; // ajuste conforme recurso que você quer

		const existingIndex = mainApp['meta-data'].findIndex(
			entry => entry.$ && entry.$['android:name'] === nameToReplace
		);

		const newMetaDataEntry = {
			$: {
				'android:name': nameToReplace,
				'android:resource': resourceValue,
				'tools:replace': 'android:resource',
			},
		};

		if (existingIndex >= 0) {
			mainApp['meta-data'][existingIndex] = newMetaDataEntry;
		} else {
			mainApp['meta-data'].push(newMetaDataEntry);
		}

		return androidManifestConfig;
	});
};

export default withReplaceMetaDataResource;
