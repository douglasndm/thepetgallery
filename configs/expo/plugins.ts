type plugins = (string | [] | [string] | [string, any])[];

const configs: plugins = [
	'expo-router',
	'@react-native-firebase/app',
	'@react-native-firebase/app-check',
	'@react-native-firebase/auth',
	'@react-native-google-signin/google-signin',
	[
		'@sentry/react-native/expo',
		{
			url: 'https://sentry.io/',
			project: 'thepetgallery',
			organization: 'douglasndm',
		},
	],
	'expo-apple-authentication',
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
	[
		'expo-notifications',
		{
			color: '#ffffff',
			defaultChannel: 'default',
			enableBackgroundRemoteNotifications: true,
		},
	],
];
export default configs;
