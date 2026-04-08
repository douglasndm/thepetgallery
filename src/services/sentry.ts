import * as Sentry from '@sentry/react-native';
import { getAuth } from '@react-native-firebase/auth';

import EnvConfig from '@services/env';

import { getInstallationId } from '@utils/device/getDeviceId';

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

async function setupInstallationId() {
	const id = await getInstallationId();
	const currentUser = getAuth().currentUser;

	if (currentUser) {
		Sentry.setUser({
			id: id,
			email: currentUser.email || undefined,
			username: currentUser.displayName || undefined,
		});
		return;
	}

	Sentry.setUser({
		id: id,
	});
}

export { setupInstallationId };
