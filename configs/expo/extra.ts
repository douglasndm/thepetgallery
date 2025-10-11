interface extra {
	[k: string]: any;
}

const configs: extra = {
	API_URL_DOG: process.env.API_URL_DOG ?? '',
	API_URL_CAT: process.env.API_URL_CAT ?? '',

	SENTRY_DSN: process.env.SENTRY_DSN ?? '',

	APPCHECK_DEBUG_TOKEN_ANDROID:
		process.env.APPCHECK_DEBUG_TOKEN_ANDROID ?? '',
	APPCHECK_DEBUG_TOKEN_IOS: process.env.APPCHECK_DEBUG_TOKEN_IOS ?? '',

	GOOGLE_CLIENT_ID_ANDROID: process.env.GOOGLE_CLIENT_ID_ANDROID ?? '',
	GOOGLE_REVERSED_CLIENT_ID_IOS:
		process.env.GOOGLE_REVERSED_CLIENT_ID_IOS ?? '',
};

export default configs;
