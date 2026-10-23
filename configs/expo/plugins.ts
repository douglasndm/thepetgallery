type plugins = (string | [] | [string] | [string, any])[];

const configs: plugins = [
	[
		'@react-native-firebase/app',
		{
			ios: {
				disableSPM: true,
			},
		},
	],
	'@react-native-firebase/auth',
	'@react-native-google-signin/google-signin',
	'@react-native-vector-icons/ionicons',
	'@react-native-vector-icons/material-design-icons',
	[
		'@sentry/react-native/expo',
		{
			url: 'https://exceptions.douglasndm.dev/',
			project: 'thepetgallery',
			organization: 'varlabs',
			options: {
				dsn: process.env.SENTRY_DSN,
				environment: process.env.APP_VARIANT,
				tracesSampleRate: 1.0,
			},
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
				buildReactNativeFromSource: true,
				useFrameworks: 'static',
				deploymentTarget: '16.4',
				forceStaticLinking: ['RNFBApp'],
			},
		},
	],
	'expo-font',
	'expo-image',
	[
		'expo-media-library',
		{
			photosPermission: 'Allow $(PRODUCT_NAME) to access your photos.',
			savePhotosPermission: 'Allow $(PRODUCT_NAME) to save photos.',
			preventAutomaticLimitedAccessAlert: true,
			isAccessMediaLocationEnabled: false,
			granularPermissions: ['photo'],
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
	'expo-router',
	'expo-secure-store',
	'expo-status-bar',
	[
		'react-native-google-mobile-ads',
		{
			androidAppId: process.env.ANDROID_ADMOB_APPID,
			iosAppId: process.env.IOS_ADMOB_APPID,
			userTrackingUsageDescription:
				'This identifier will be used to deliver personalized ads to you.',
		},
	],
];
export default configs;
