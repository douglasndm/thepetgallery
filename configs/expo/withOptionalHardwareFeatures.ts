import { ConfigPlugin, withAndroidManifest } from 'expo/config-plugins';

// Recursos que a Play Store deduz como obrigatórios (pela orientação portrait
// e pela permissão ACCESS_WIFI_STATE) mas que não são essenciais para o app.
const OPTIONAL_FEATURES = [
	'android.hardware.screen.portrait',
	'android.hardware.wifi',
];

const withOptionalHardwareFeatures: ConfigPlugin = config =>
	withAndroidManifest(config, androidConfig => {
		const manifest = androidConfig.modResults.manifest;

		if (!manifest['uses-feature']) {
			manifest['uses-feature'] = [];
		}
		const features = manifest['uses-feature'];

		OPTIONAL_FEATURES.forEach(name => {
			const existing = features.find(f => f.$['android:name'] === name);
			if (existing) {
				existing.$['android:required'] = 'false';
			} else {
				features.push({
					$: { 'android:name': name, 'android:required': 'false' },
				});
			}
		});

		return androidConfig;
	});

export default withOptionalHardwareFeatures;
