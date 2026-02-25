import { Platform } from 'react-native';
import { getSystemVersion } from 'react-native-device-info';
import {
	checkNotifications,
	requestNotifications,
} from 'react-native-permissions';

async function requestNotificationPermission(): Promise<void> {
	if (Platform.OS === 'android' && Number(getSystemVersion()) >= 13) {
		await requestNotifications(['alert', 'sound', 'badge']);
		return;
	}

	const status = await checkNotifications();

	if (status.status === 'denied') {
		await requestNotifications(['alert', 'sound', 'badge']);
	}
}

export { requestNotificationPermission };
