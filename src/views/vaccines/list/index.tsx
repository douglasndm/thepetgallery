import React, { useState, useCallback } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
	collection,
	doc,
	getDocs,
	FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { useTranslation } from 'react-i18next';

import { getUserPetsReference } from '@services/firebase/firestore';
import { captureException } from '@services/exceptionsHandler';

import Header from '@components/header';
import ActionButton from '@components/actionButton';
import Loading from '@components/loading';
import Padding from '@components/padding';

import { formatDate } from '@utils/data';

import {
	Container,
	VaccineContainer,
	VaccineContent,
	TextContainer,
	VaccineName,
	VaccineDate,
} from './styles';

const VaccinesList: React.FC = () => {
	const router = useRouter();
	const { t } = useTranslation();
	const { petId } = useLocalSearchParams<{ petId: string }>();

	const [isLoading, setIsLoading] = useState(true);
	const [vaccines, setVaccines] = useState<IVaccine[]>([]);
	type FirestoreVaccineData = {
		name: string;
		date_administered?: FirebaseFirestoreTypes.Timestamp | null;
		next_dose_date?: FirebaseFirestoreTypes.Timestamp | null;
		notes: string | null;
	};

	const loadData = useCallback(async () => {
		if (!petId) {
			return;
		}

		try {
			setIsLoading(true);
			const petsReference = await getUserPetsReference();

			if (petsReference) {
				const petRef = doc(petsReference, petId);
				const vaccinesCollection = collection(petRef, 'vaccines');

				const snapshot = await getDocs(vaccinesCollection);
				const localVaccines: IVaccine[] = [];

				snapshot.docs.forEach(
					(
						localDoc: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
					) => {
						const vaccine = localDoc.data() as FirestoreVaccineData;

						localVaccines.push({
							id: localDoc.id,
							name: vaccine.name,
							date_administered: vaccine.date_administered
								? vaccine.date_administered.toDate()
								: null,
							next_dose_date: vaccine.next_dose_date
								? vaccine.next_dose_date.toDate()
								: null,
							notes: vaccine.notes,
						});
					}
				);

				setVaccines(localVaccines);
			}
		} catch (error) {
			captureException({
				error,
				showAlert: true,
			});
		} finally {
			setIsLoading(false);
		}
	}, [petId]);

	useFocusEffect(
		useCallback(() => {
			loadData();
		}, [loadData])
	);

	const navigateToAddVaccine = useCallback(() => {
		if (!petId) {
			return;
		}

		router.push({
			pathname: '/pets/[petId]/vaccines/add',
			params: { petId },
		});
	}, [petId, router]);

	const navigateToVaccine = useCallback(
		(id: string) => {
			if (!petId) {
				return;
			}

			router.push({
				pathname: '/pets/[petId]/vaccines/[id]',
				params: { petId, id },
			});
		},
		[petId, router]
	);

	return (
		<Container>
			<Header />

			<ActionButton
				title={t('vaccines.addVaccine')}
				iconName="create-outline"
				onPress={navigateToAddVaccine}
			/>

			{isLoading && <Loading />}

			{vaccines.map(vaccine => {
				let formattedDate: string | null = null;

				if (vaccine.date_administered) {
					formattedDate = formatDate(
						new Date(vaccine.date_administered)
					);
				}

				return (
					<VaccineContainer key={vaccine.id}>
						<VaccineContent
							onPress={() =>
								navigateToVaccine(vaccine.id.toString())
							}
						>
							<TextContainer>
								<VaccineName>{vaccine.name}</VaccineName>
								{!!formattedDate && (
									<VaccineDate>
										{`${t('vaccines.dateAdministeredPrefix')}: ${formattedDate}`}
									</VaccineDate>
								)}
							</TextContainer>
						</VaccineContent>
					</VaccineContainer>
				);
			})}
			<Padding />
		</Container>
	);
};

export default VaccinesList;
