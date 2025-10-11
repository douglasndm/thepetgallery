type plugins = (string | [] | [string] | [string, any])[];

const configs: plugins = [
	'@react-native-firebase/app',
	'@react-native-firebase/app-check',
	'@react-native-firebase/auth',
	[
		'@sentry/react-native/expo',
		{
			url: 'https://sentry.io/',
			project: 'thepetgallery',
			organization: 'douglasndm',
		},
	],
	[
		'expo-asset',
		{
			assets: ['./assets/animations/', './assets/images/'],
		},
	],
	[
		'expo-build-properties',
		{
			ios: {
				useFrameworks: 'static',
				deploymentTarget: '15.5',
				forceStaticLinking: ['RNFBApp'],
			},
		},
	],
];
export default configs;
