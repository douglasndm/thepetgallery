import * as Sentry from '@sentry/react-native';
import { getAuth } from '@react-native-firebase/auth';

import EnvConfig from '@services/env';

import { getInstallationId } from '@utils/device/getDeviceId';

Sentry.init({
	enabled: !__DEV__,
	dsn: EnvConfig.SENTRY_DSN,

	sendDefaultPii: true,
	enableLogs: true,

	sampleRate: 1.0,
	profilesSampleRate: 0.45,
	tracesSampleRate: 0.45,

	integrations: [
		Sentry.consoleLoggingIntegration({
			levels: ['log', 'debug', 'info', 'warn', 'error'],
		}),
	],
});

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
