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

	ANDROID_ADMOB_APPID: process.env.ANDROID_ADMOB_APPID ?? '',
	ANDROID_ADMOB_ADUNITID_NATIVE_BETWEEN_PETS_PICUTRES:
		process.env.ANDROID_ADMOB_ADUNITID_NATIVE_BETWEEN_PETS_PICUTRES ?? '',

	IOS_ADMOB_APPID: process.env.IOS_ADMOB_APPID ?? '',
	IOS_ADMOB_ADUNITID_NATIVE_BETWEEN_PETS_PICUTRES:
		process.env.IOS_ADMOB_ADUNITID_NATIVE_BETWEEN_PETS_PICUTRES ?? '',
};

export default configs;
