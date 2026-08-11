import { getAuth } from '@react-native-firebase/auth';
import {
	getFirestore,
	collection,
	doc,
	setDoc,
} from '@react-native-firebase/firestore';
import { getMessaging } from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';

async function registerLogin(): Promise<void> {
	const user = getAuth().currentUser;

	if (user) {
		const userCollection = collection(getFirestore(), 'users');
		const userDoc = doc(userCollection, user.uid);

		const device_brand = await DeviceInfo.getBrand();
		const device_model = await DeviceInfo.getModel();
		const device_id = await DeviceInfo.getUniqueId();
		const device_so = await DeviceInfo.getSystemName();
		const device_so_version = await DeviceInfo.getSystemVersion();
		const device_mac = await DeviceInfo.getMacAddress();

		const user_ip = await DeviceInfo.getIpAddress();
		const messagingToken = await getMessaging().getToken();

		const app_version = await DeviceInfo.getVersion();
		const app_build = await DeviceInfo.getBuildNumber();

		await setDoc(
			userDoc,
			{
				device: {
					device_brand,
					device_model,
					device_id,
					device_so,
					device_so_version,
					device_mac,
					user_ip,
					messagingToken,
					app_version,
					app_build,
					last_login: new Date(),
				},
			},
			{ merge: true }
		);
	}
}

export { registerLogin };
