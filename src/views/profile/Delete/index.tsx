import React, { useState, useCallback } from 'react';
import { Dialog, Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getAuth, deleteUser } from '@react-native-firebase/auth';
import {
	getFirestore,
	collection,
	doc,
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

			const petsSnapshot = await userRef.collection('pets').get();
			for (const petDoc of petsSnapshot.docs) {
				const vaccinesSnapshot = await petDoc.ref
					.collection('vaccines')
					.get();
				for (const vaccineDoc of vaccinesSnapshot.docs) {
					await vaccineDoc.ref.delete();
				}

				const medicationsSnapshot = await petDoc.ref
					.collection('medications')
					.get();
				for (const medicationDoc of medicationsSnapshot.docs) {
					await medicationDoc.ref.delete();
				}

				await petDoc.ref.delete();
			}

			await userRef.delete();

			await deleteUser(user);

			showMessage({
				message: 'Conta excluida com sucesso',
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
	}, [router]);

	return (
		<Dialog visible={props.visible} onDismiss={hideDialog}>
			<Dialog.Title>Você tem certeza?</Dialog.Title>

			{isLoading && <Loading />}

			<Dialog.Content>
				<Text variant="bodyMedium">
					Você vai excluir sua conta, incluindo pets e vacinas
					cadastradas, essa operação não pode ser desfeita.
				</Text>
			</Dialog.Content>
			<Dialog.Actions>
				<Button
					onPress={handleDelete}
					textColor="red"
					disabled={isLoading}
				>
					Apagar
				</Button>
				<Button onPress={hideDialog} disabled={isLoading}>
					Manter
				</Button>
			</Dialog.Actions>
		</Dialog>
	);
};

export default DeleteAccount;
