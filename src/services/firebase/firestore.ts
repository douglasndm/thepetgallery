import { getAuth } from '@react-native-firebase/auth';
import {
	getFirestore,
	collection,
	doc,
	CollectionReference,
	DocumentData,
} from '@react-native-firebase/firestore';
import netInfo from '@react-native-community/netinfo';

async function getUserPetsReference(): Promise<CollectionReference<DocumentData> | null> {
	const { isConnected, isInternetReachable } = await netInfo.fetch();
	const user = getAuth().currentUser;

	if (!isConnected && isInternetReachable) {
		console.log(
			'Internet is not available, returning null as user pets reference'
		);
		return null;
	}

	if (!getAuth().currentUser || !user) {
		console.log(
			'User is not logged in, returning null as user pets reference'
		);
		return null;
	}

	const usersCollection = collection(getFirestore(), 'users');
	const userDoc = doc(usersCollection, user.uid);
	const petsCollection = collection(userDoc, 'pets');

	return petsCollection;
}

export { getUserPetsReference };
