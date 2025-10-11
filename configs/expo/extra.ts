interface extra {
	[k: string]: any;
}

const configs: extra = {
	eas: {
		projectId: '3ce8ca86-09ca-4432-9f90-0468e97b1684',
	},
	API_URL_DOG: process.env.API_URL_DOG ?? '',
	API_URL_CAT: process.env.API_URL_CAT ?? '',

	SENTRY_DSN: process.env.SENTRY_DSN ?? '',

	APPCHECK_DEBUG_TOKEN_ANDROID:
		process.env.APPCHECK_DEBUG_TOKEN_ANDROID ?? '',
	APPCHECK_DEBUG_TOKEN_IOS: process.env.APPCHECK_DEBUG_TOKEN_IOS ?? '',
};

export default configs;
