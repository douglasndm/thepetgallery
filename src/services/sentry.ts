import * as Sentry from '@sentry/react-native';

import EnvConfig from '@services/env';

if (!__DEV__) {
	Sentry.init({
		dsn: EnvConfig.SENTRY_DSN,

		sendDefaultPii: true,
		enableLogs: true,

		sampleRate: 0.45,
		profilesSampleRate: 0.45,
		tracesSampleRate: 0.0,
		replaysSessionSampleRate: 0.5,
		replaysOnErrorSampleRate: 1.0,

		integrations: [
			Sentry.consoleLoggingIntegration({
				levels: ['log', 'debug', 'info', 'warn', 'error'],
			}),
			Sentry.mobileReplayIntegration({
				maskAllText: false,
				maskAllImages: false,
				maskAllVectors: false,
			}),
		],
	});
}
