import uuid from 'react-native-uuid';

import * as SecureStore from '@services/secureStore';

async function getInstallationId(): Promise<string> {
	const installationId = await SecureStore.getItemAsync('installationId');

	if (installationId) {
		return installationId;
	}

	console.info(`No installationId found, generating a new one`);
	const newInstallationId = uuid.v4();
	await SecureStore.setItemAsync('installationId', newInstallationId);

	return newInstallationId;
}

export { getInstallationId };
