import React, { useEffect, useCallback, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, collection } from '@react-native-firebase/firestore';

import { getUserPetsReference } from '@services/firebase/firestore';
import { captureException } from '@services/exceptionsHandler';

import Header from '@components/header';
import ActionButton from '@components/actionButton';
import Loading from '@components/loading';

import { Container, Content, Name, MoreInfo } from './styles';

const VaccinesDetails: React.FC = () => {
	const router = useRouter();
	const { petId, id } = useLocalSearchParams<{ petId: string; id: string }>();

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [vaccine, setVaccine] = useState<IVaccine>();

	const loadData = useCallback(async () => {
		if (!petId || !id) {
			return;
		}

		try {
			setIsLoading(true);

			const petsReference = await getUserPetsReference();

			if (petsReference) {
				const petDoc = doc(petsReference, petId);
				const vaccinesCollection = collection(petDoc, 'vaccines');

				const vaccineDoc = await getDoc(vaccinesCollection.doc(id));

				if (vaccineDoc.exists) {
					const data = vaccineDoc.data();

					if (!data) return;

					setVaccine({
						id: vaccineDoc.id,
						name: data.name,
						date_administered: data.date_administered
							? data.date_administered.toDate()
							: null,
						next_dose_date: data.next_dose_date
							? data.next_dose_date.toDate()
							: null,
						notes: data.notes,
					});
				}
			}
		} catch (error) {
			captureException({
				error,
				showAlert: true,
			});
		} finally {
			setIsLoading(false);
		}
	}, [petId, id]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const navigateToEditVaccine = useCallback(() => {
		if (!petId || !id) {
			return;
		}

		router.push({
			pathname: '/pets/[petId]/vaccines/[id]/edit',
			params: { petId, id },
		});
	}, [router, petId, id]);

	return (
		<Container>
			<Header />

			<ActionButton
				iconName="create-outline"
				title="Editar vacina"
				onPress={navigateToEditVaccine}
			/>

			{isLoading ? (
				<Loading />
			) : (
				<Content>
					{vaccine?.name && <Name>{vaccine.name}</Name>}

					{vaccine?.date_administered && (
						<MoreInfo>
							Aplicada em:{' '}
							{vaccine.date_administered.toLocaleDateString('pt-BR')}
						</MoreInfo>
					)}

					{vaccine?.next_dose_date && (
						<MoreInfo>
							Próxima dose em:{' '}
							{vaccine.next_dose_date.toLocaleDateString('pt-BR')}
						</MoreInfo>
					)}

					{vaccine?.notes && (
						<MoreInfo>Observações: {vaccine.notes}</MoreInfo>
					)}
				</Content>
			)}
		</Container>
	);
};

export default VaccinesDetails;
