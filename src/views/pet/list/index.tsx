import React, { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { getUserPetsReference } from '@services/firebase/firestore';
import { captureException } from '@services/exceptionsHandler';

import Header from '@components/header';
import Padding from '@components/padding';
import Loading from '@components/loading';

import {
	Container,
	Hero,
	HeroTitle,
	HeroDescription,
	PetContainer,
	PetContent,
	TextContainer,
	PetMetaRow,
	PetBadge,
	PetBadgeText,
	PetName,
	PetBreed,
	Icon,
	Chevron,
	EmptyListName,
	EmptyStateCard,
	EmptyStateIcon,
	ActionButtonContainer,
	ActionButtonIcon,
	ActionButtonText,
} from './styles';

const PetList: React.FC = () => {
	const router = useRouter();
	const { t } = useTranslation();

	const [pets, setPets] = useState<IPet[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const loadData = useCallback(async () => {
		try {
			setIsLoading(true);
			const petsReference = await getUserPetsReference();

			if (petsReference) {
				const petsSnapshot = await petsReference.get();

				const localPets: IPet[] = [];

				petsSnapshot.forEach(doc => {
					const pet = doc.data() as IPet;
					localPets.push({
						...pet,
						id: doc.id,
					});
				});

				setPets(localPets);
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
	}, []);

	const navigateToPet = useCallback(
		(id: string) => {
			router.push({ pathname: '/pets/[id]', params: { id } });
		},
		[router]
	);

	const navigateToAddPet = useCallback(() => {
		router.push('/pets/add');
	}, [router]);

	useFocusEffect(
		useCallback(() => {
			loadData();
		}, [loadData])
	);

	return (
		<Container>
			<Header />

			<Hero>
				<HeroTitle>{t('tabs.pets')}</HeroTitle>
				<HeroDescription>{t('pets.listDescription')}</HeroDescription>
			</Hero>

			<ActionButtonContainer onPress={navigateToAddPet}>
				<ActionButtonIcon name="add" />
				<ActionButtonText>{t('pets.addPet')}</ActionButtonText>
			</ActionButtonContainer>

			{isLoading && <Loading />}

			{!isLoading &&
				pets.map(pet => {
					let specieIcon: 'dog' | 'cat' | null = null;

					if (pet.species === 'dog') {
						specieIcon = 'dog';
					} else if (pet.species === 'cat') {
						specieIcon = 'cat';
					}

					return (
						<PetContainer key={pet.id}>
							<PetContent
								onPress={() => navigateToPet(pet.id.toString())}
							>
								<TextContainer>
									<PetMetaRow>
										<PetBadge>
											<PetBadgeText>
												{pet.species === 'dog'
													? t('pets.dog')
													: pet.species === 'cat'
														? t('pets.cat')
														: t('pets.other')}
											</PetBadgeText>
										</PetBadge>
									</PetMetaRow>
									<PetName>{pet.name}</PetName>
									<PetBreed>
										{pet.breed || t('pets.noBreed')}
									</PetBreed>
								</TextContainer>

								{specieIcon && <Icon name={specieIcon} />}
								<Chevron />
							</PetContent>
						</PetContainer>
					);
				})}

			{!isLoading && pets.length <= 0 && (
				<EmptyStateCard>
					<EmptyStateIcon />
					<EmptyListName>{t('pets.emptyState')}</EmptyListName>
				</EmptyStateCard>
			)}

			<Padding />
		</Container>
	);
};

export default PetList;
