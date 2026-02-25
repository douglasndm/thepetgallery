import React, { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';

import { getUserPetsReference } from '@services/firebase/firestore';
import { captureException } from '@services/exceptionsHandler';

import Header from '@components/header';
import Padding from '@components/padding';

import {
	Container,
	PetContainer,
	PetContent,
	TextContainer,
	PetName,
	PetBreed,
	Icon,
	EmptyListName,
	ActionButtonContainer,
	ActionButtonIcon,
	ActionButtonText,
} from './styles';

const PetList: React.FC = () => {
	const router = useRouter();

	const [pets, setPets] = useState<IPet[]>([]);

	const loadData = useCallback(async () => {
		try {
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

			<ActionButtonContainer onPress={navigateToAddPet}>
				<ActionButtonIcon name="add" />
				<ActionButtonText>Adicionar pet</ActionButtonText>
			</ActionButtonContainer>

			{pets.map(pet => {
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
								<PetName>{pet.name}</PetName>
								<PetBreed>{pet.breed}</PetBreed>
							</TextContainer>

							{specieIcon && <Icon name={specieIcon} />}
						</PetContent>
					</PetContainer>
				);
			})}

			{pets.length <= 0 && (
				<EmptyListName>
					Cadastre seus pets para facilitar o acompanhamento deles
				</EmptyListName>
			)}

			<Padding />
		</Container>
	);
};

export default PetList;
