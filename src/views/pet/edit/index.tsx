import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import RadioGroup, { RadioButtonProps } from 'react-native-radio-buttons-group';
import DateTimePicker from 'react-native-ui-datepicker';
import { showMessage } from 'react-native-flash-message';

import { getUserPetsReference } from '@services/firebase/firestore';
import { captureException } from '@services/exceptionsHandler';

import Header from '@components/header';
import ActionButton from '@components/actionButton';
import Button from '@components/button';
import Loading from '@components/loading';
import Padding from '@components/padding';

import DeletePet from './delete';

import { Container, Content, Input, Label } from '../add/styles';

const EditPet: React.FC = () => {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);

	const [name, setName] = useState<string>('');

	const [species, setSpecies] = useState<string | undefined>(undefined);

	const [date, setDate] = useState<Date>(new Date());
	const [useBirthDate, setUseBirthDate] = useState<boolean>(false);

	const [breed, setBreed] = useState<string | undefined>();
	const [weight, setWeight] = useState<string | undefined>();
	const [healthNotes, setHealthNotes] = useState<string | undefined>();

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

					setName(pet.name);
					setSpecies(pet.species || undefined);
					setBreed(pet.breed || undefined);
					setHealthNotes(pet.health_notes || undefined);

					if (pet.weight) {
						setWeight(pet.weight.toString());
					}

					let birthDate: Date | null = null;

					if (petsSnapshot.data()?.birth_date) {
						birthDate = petsSnapshot.data()?.birth_date.toDate();

						if (birthDate) {
							setDate(birthDate);
							setUseBirthDate(true);
						}
					}
				}
			}
		} catch (error) {
			captureException({ error, showAlert: true });
		} finally {
			setIsLoading(false);
		}
	}, [id]);

	const handleUpdate = useCallback(async () => {
		if (!id) {
			return;
		}

		try {
			setIsLoading(true);

			const petsReference = await getUserPetsReference();

			if (petsReference) {
				await petsReference.doc(id).update({
					name,
					species,
					breed: breed || null,
					weight: weight ? Number(weight) : null,
					health_notes: healthNotes || null,
					birth_date: useBirthDate ? date : null,
				});

				showMessage({
					message: 'Pet atualizado com sucesso',
					type: 'success',
				});

				router.back();
			}
		} catch (error) {
			captureException({ error, showAlert: true });
		} finally {
			setIsLoading(false);
		}
	}, [name, species, breed, weight, healthNotes, useBirthDate, date, router, id]);

	const radioButtons: RadioButtonProps[] = useMemo(
		() => [
			{
				id: 'dog',
				label: 'Cachorro',
				value: 'dog',
			},
			{
				id: 'cat',
				label: 'Gato',
				value: 'cat',
			},
			{
				id: 'null',
				label: 'Outro',
				value: undefined,
			},
		],
		[]
	);

	const useBirthDateRadioButtons: RadioButtonProps[] = useMemo(
		() => [
			{
				id: 'yes',
				label: 'Sim',
				value: 'yes',
			},
			{
				id: 'no',
				label: 'Não',
				value: 'no',
			},
		],
		[]
	);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const handleWeightChange = useCallback((value: string) => {
		const regex = /^-?\d*(\.\d*)?$/;
		if (regex.test(value)) {
			setWeight(value.trim());
		}
	}, []);

	return (
		<Container>
			<Header />

			<ActionButton
				iconName="trash-outline"
				title="Excluir pet"
				onPress={() => setShowDeleteDialog(true)}
			/>

			{isLoading ? (
				<Loading />
			) : (
				<Content>
					<Input
						placeholder="Nome do pet"
						value={name}
						onChangeText={setName}
					/>

					<Label>Espécie</Label>

					<RadioGroup
						radioButtons={radioButtons}
						onPress={setSpecies}
						selectedId={species}
						containerStyle={{
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}
					/>

					<Input
						placeholder="Raça"
						value={breed}
						onChangeText={setBreed}
					/>
					<Input
						placeholder="Peso"
						keyboardType="numeric"
						value={weight}
						onChangeText={handleWeightChange}
					/>

					<Input
						placeholder="Observações"
						multiline
						numberOfLines={5}
						value={healthNotes}
						onChangeText={setHealthNotes}
					/>

					<Label>Editar data de nascimento</Label>
					<RadioGroup
						radioButtons={useBirthDateRadioButtons}
						onPress={selected => {
							if (selected === 'yes') {
								setUseBirthDate(true);
							} else {
								setUseBirthDate(false);
							}
						}}
						selectedId={useBirthDate ? 'yes' : 'no'}
						containerStyle={{
							flexDirection: 'row',
							justifyContent: 'center',
						}}
					/>

					{useBirthDate && (
						<>
							<Label>Data de nascimento</Label>

							<DateTimePicker
								mode="single"
								date={date}
								onChange={change => {
									if (change.date) {
										setDate(new Date(String(change.date)));
									}
								}}
							/>
						</>
					)}

					<Button title="Salvar" onPress={handleUpdate} />
				</Content>
			)}

			<DeletePet
				visible={showDeleteDialog}
				setVisible={setShowDeleteDialog}
				petId={id ?? ''}
			/>
			<Padding />
		</Container>
	);
};

export default EditPet;
