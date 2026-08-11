import React, { useState, useCallback } from 'react';
import { Dialog, Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getAuth, deleteUser } from '@react-native-firebase/auth';
import { useTranslation } from 'react-i18next';
import {
	getFirestore,
	collection,
	doc,
	getDocs,
	deleteDoc,
} from '@react-native-firebase/firestore';
import { showMessage } from 'react-native-flash-message';

import { captureException } from '@services/exceptionsHandler';

import Loading from '@components/loading';

interface Props {
	visible: boolean;
	setVisible: (visible: boolean) => void;
}

const DeleteAccount: React.FC<Props> = (props: Props) => {
	const router = useRouter();
	const { t } = useTranslation();

	const [isLoading, setIsLoading] = useState(false);

	const hideDialog = useCallback(() => {
		props.setVisible(false);
	}, [props]);

	const handleDelete = useCallback(async () => {
		try {
			setIsLoading(true);

			const user = getAuth().currentUser;

			if (!user) {
				console.log('User is not logged in');
				return;
			}

			const usersCollection = collection(getFirestore(), 'users');
			const userRef = doc(usersCollection, user.uid);
			const petsCollection = collection(userRef, 'pets');

			const petsSnapshot = await getDocs(petsCollection);

			for (const petDoc of petsSnapshot.docs) {
				const vaccinesCollection = collection(petDoc.ref, 'vaccines');
				const vaccinesSnapshot = await getDocs(vaccinesCollection);

				for (const vaccineDoc of vaccinesSnapshot.docs) {
					await deleteDoc(vaccineDoc.ref);
				}

				const medicationsCollection = collection(
					petDoc.ref,
					'medications'
				);
				const medicationsSnapshot = await getDocs(
					medicationsCollection
				);

				for (const medicationDoc of medicationsSnapshot.docs) {
					await deleteDoc(medicationDoc.ref);
				}

				await deleteDoc(petDoc.ref);
			}

			await deleteDoc(userRef);

			await deleteUser(user);

			showMessage({
				message: t('profile.accountDeletedSuccess'),
				type: 'success',
			});

			router.replace('/dogs');
		} catch (error) {
			captureException({
				error,
				showAlert: true,
			});
		} finally {
			setIsLoading(false);
		}
	}, [router, t]);

	return (
		<Dialog visible={props.visible} onDismiss={hideDialog}>
			<Dialog.Title>{t('common.confirmDeleteTitle')}</Dialog.Title>

			{isLoading && <Loading />}

			<Dialog.Content>
				<Text variant="bodyMedium">
					{t('profile.deleteDescription')}
				</Text>
			</Dialog.Content>
			<Dialog.Actions>
				<Button
					onPress={handleDelete}
					textColor="red"
					disabled={isLoading}
				>
					{t('common.delete')}
				</Button>
				<Button onPress={hideDialog} disabled={isLoading}>
					{t('common.keep')}
				</Button>
			</Dialog.Actions>
		</Dialog>
	);
};

export default DeleteAccount;
