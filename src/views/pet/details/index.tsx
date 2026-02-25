import React, { useState, useCallback, useMemo } from 'react';
import {
	useFocusEffect,
	useLocalSearchParams,
	useRouter,
} from 'expo-router';
import { useTranslation } from 'react-i18next';

import { getCurrentLanguage } from '@app/i18n';
import { getUserPetsReference } from '@services/firebase/firestore';
import { captureException } from '@services/exceptionsHandler';

import Header from '@components/header';
import Loading from '@components/loading';
import Button from '@components/button';

import {
	Container,
	Content,
	Icon,
	Name,
	Species,
	Breed,
	BirthDate,
	Weight,
	HealthNotes,
	ActionButtonContainer,
	ActionButtonIcon,
	ActionButtonText,
} from './styles';

const PetDetails: React.FC = () => {
	const router = useRouter();
	const { t } = useTranslation();
	const { id } = useLocalSearchParams<{ id: string }>();

	const [isLoading, setIsLoading] = useState(true);
	const [petInfo, setPetInfo] = useState<IPet>();

	const loadData = useCallback(async () => {
		if (!id) {
			return;
		}

		try {
			setIsLoading(true);
			const petsReference = await getUserPetsReference();

			if (petsReference) {
				const petsSnapshot = await petsReference.doc(id).get();

				if (petsSnapshot.exists) {
					const pet = petsSnapshot.data() as IPet;

					let birthDate: Date | null = null;

					if (petsSnapshot.data()?.birth_date) {
						birthDate = petsSnapshot.data()?.birth_date.toDate();
					}

					setPetInfo({
						id: petsSnapshot.id,
						name: pet.name,
						breed: pet.breed,
						species: pet.species,
						weight: pet.weight,
						birth_date: birthDate,
						health_notes: pet.health_notes,
					});
				}
			}
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes('firestore/permission-denied')) {
					return;
				}
			}
			captureException({ error, showAlert: true });
		} finally {
			setIsLoading(false);
		}
	}, [id]);

	useFocusEffect(
		useCallback(() => {
			loadData();
		}, [loadData])
	);

	const iconName = useMemo(() => {
		if (petInfo?.species) {
			if (petInfo.species === 'dog') {
				return 'dog';
			}

			if (petInfo.species === 'cat') {
				return 'cat';
			}
		}

		return undefined;
	}, [petInfo]);

	const birthDate = useMemo(() => {
		if (!petInfo?.birth_date) return null;

		const date = new Date(petInfo.birth_date);
		const options = {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		} as const;
		const formattedDate = new Intl.DateTimeFormat(
			getCurrentLanguage(),
			options
		).format(date);

		return formattedDate;
	}, [petInfo]);

	const navigateToEditPet = useCallback(() => {
		if (!id) {
			return;
		}

		router.push({ pathname: '/pets/[id]/edit', params: { id } });
	}, [router, id]);

	const navigateToVaccines = useCallback(() => {
		if (!id) {
			return;
		}

		router.push({
			pathname: '/pets/[petId]/vaccines',
			params: { petId: id },
		});
	}, [router, id]);

	return (
		<Container>
			<Header />

			{!isLoading && (
				<ActionButtonContainer onPress={navigateToEditPet}>
					<ActionButtonIcon name="create-outline" />
					<ActionButtonText>{t('pets.editPet')}</ActionButtonText>
				</ActionButtonContainer>
			)}

			{isLoading ? (
				<Loading />
			) : (
				<Content>
					{!!iconName && <Icon name={iconName} />}

					<Name>{petInfo?.name}</Name>

					{petInfo?.species && (
						<Species>
							{t('pets.speciesPrefix')}:{' '}
							{petInfo?.species === 'dog'
								? t('pets.dog')
								: t('pets.cat')}
						</Species>
					)}

					{petInfo?.breed && (
						<Breed>
							{t('pets.breedPrefix')}: {petInfo?.breed}
						</Breed>
					)}

					{birthDate && (
						<BirthDate>
							{t('pets.birthPrefix')}: {birthDate}
						</BirthDate>
					)}

					{petInfo?.weight && (
						<Weight>
							{t('pets.weightPrefix')}: {petInfo?.weight}KG
						</Weight>
					)}

					{petInfo?.health_notes && (
						<HealthNotes>
							{t('pets.extraDataPrefix')}: {petInfo?.health_notes}
						</HealthNotes>
					)}
				</Content>
			)}

			<Button title={t('pets.viewVaccines')} onPress={navigateToVaccines} />
		</Container>
	);
};

export default PetDetails;
