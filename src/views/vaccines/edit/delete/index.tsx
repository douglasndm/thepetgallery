import React, { useState, useCallback } from 'react';
import { Dialog, Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { doc, collection, deleteDoc } from '@react-native-firebase/firestore';
import { showMessage } from 'react-native-flash-message';
import { useTranslation } from 'react-i18next';

import { getUserPetsReference } from '@services/firebase/firestore';
import { captureException } from '@services/exceptionsHandler';

import Loading from '@components/loading';

interface Props {
	visible: boolean;
	setVisible: (visible: boolean) => void;
	petId: string;
	vaccineId: string;
}

const DeleteVaccine: React.FC<Props> = (props: Props) => {
	const router = useRouter();
	const { t } = useTranslation();

	const [isLoading, setIsLoading] = useState(false);

	const hideDialog = useCallback(() => {
		props.setVisible(false);
	}, [props]);

	const handleDelete = useCallback(async () => {
		try {
			setIsLoading(true);

			const petsReference = await getUserPetsReference();

			if (petsReference) {
				const petDoc = doc(petsReference, props.petId);
				const vaccinesCollection = collection(petDoc, 'vaccines');
				const vaccineDoc = doc(vaccinesCollection, props.vaccineId);

				await deleteDoc(vaccineDoc);

				showMessage({
					message: t('vaccines.deletedSuccess'),
					type: 'success',
				});

				router.replace({
					pathname: '/pets/[petId]/vaccines',
					params: { petId: props.petId },
				});
			}
		} catch (error) {
			captureException({
				error,
				showAlert: true,
			});
		} finally {
			setIsLoading(false);
		}
	}, [props.petId, props.vaccineId, router, t]);

	return (
		<Dialog visible={props.visible} onDismiss={hideDialog}>
			<Dialog.Title>{t('common.confirmDeleteTitle')}</Dialog.Title>

			{isLoading && <Loading />}

			<Dialog.Content>
				<Text variant="bodyMedium">
					{t('vaccines.deleteDescription')}
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

export default DeleteVaccine;
