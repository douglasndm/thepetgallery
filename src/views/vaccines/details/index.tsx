import React, { useEffect, useCallback, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
	doc,
	getDoc,
	collection,
	FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { useTranslation } from 'react-i18next';

import { getCurrentLanguage } from '@app/i18n';
import { getUserPetsReference } from '@services/firebase/firestore';
import { captureException } from '@services/exceptionsHandler';

import Header from '@components/header';
import Loading from '@components/loading';

import {
	Container,
	HeroCard,
	Name,
	Subtitle,
	Content,
	InfoCard,
	InfoRow,
	InfoLabel,
	InfoValue,
	ActionButtonContainer,
	ActionButtonIcon,
	ActionButtonText,
} from './styles';

const VaccinesDetails: React.FC = () => {
	const router = useRouter();
	const { t } = useTranslation();
	const { petId, id } = useLocalSearchParams<{ petId: string; id: string }>();

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [vaccine, setVaccine] = useState<IVaccine>();
	type FirestoreVaccineData = {
		name: string;
		date_administered?: FirebaseFirestoreTypes.Timestamp | null;
		next_dose_date?: FirebaseFirestoreTypes.Timestamp | null;
		notes: string | null;
	};

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

				if (vaccineDoc.exists()) {
					const data = vaccineDoc.data() as
						| FirestoreVaccineData
						| undefined;

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

			{!isLoading && (
				<ActionButtonContainer onPress={navigateToEditVaccine}>
					<ActionButtonIcon name="create-outline" />
					<ActionButtonText>
						{t('vaccines.editVaccine')}
					</ActionButtonText>
				</ActionButtonContainer>
			)}

			{isLoading ? (
				<Loading />
			) : (
				<>
					<HeroCard>
						<Name>{vaccine?.name}</Name>
						<Subtitle>{t('vaccines.detailsDescription')}</Subtitle>
					</HeroCard>

					<Content>
						<InfoCard>
							{!!vaccine?.date_administered && (
								<InfoRow>
									<InfoLabel>
										{t('vaccines.appliedOnPrefix')}
									</InfoLabel>
									<InfoValue>
										{vaccine.date_administered.toLocaleDateString(
											getCurrentLanguage()
										)}
									</InfoValue>
								</InfoRow>
							)}

							{!!vaccine?.next_dose_date && (
								<InfoRow>
									<InfoLabel>
										{t('vaccines.nextDosePrefix')}
									</InfoLabel>
									<InfoValue>
										{vaccine.next_dose_date.toLocaleDateString(
											getCurrentLanguage()
										)}
									</InfoValue>
								</InfoRow>
							)}

							{!!vaccine?.notes && (
								<InfoRow style={{ borderBottomWidth: 0 }}>
									<InfoLabel>
										{t('vaccines.notesPrefix')}
									</InfoLabel>
									<InfoValue>{vaccine.notes}</InfoValue>
								</InfoRow>
							)}
						</InfoCard>
					</Content>
				</>
			)}
		</Container>
	);
};

export default VaccinesDetails;
