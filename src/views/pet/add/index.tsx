import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import RadioGroup, { RadioButtonProps } from 'react-native-radio-buttons-group';
import DateTimePicker from 'react-native-ui-datepicker';
import { showMessage } from 'react-native-flash-message';

import { captureException } from '@services/exceptionsHandler';

import { savePet } from '@utils/pets/save';

import Header from '@components/header';
import Padding from '@components/padding';
import Button from '@components/button';

import { Container, Content, Input, Label } from './styles';

const AddPet: React.FC = () => {
	const router = useRouter();

	const [isSaving, setIsSaving] = useState<boolean>(false);

	const [name, setName] = useState<string>('');

	const [species, setSpecies] = useState<string | undefined>();

	const [date, setDate] = useState<Date>(new Date());
	const [useBirthDate, setUseBirthDate] = useState<boolean>(false);

	const [breed, setBreed] = useState<string>('');
	const [weight, setWeight] = useState<string>();
	const [healthNotes, setHealthNotes] = useState<string>('');

	const handleSave = useCallback(async () => {
		try {
			setIsSaving(true);

			const localSpecies =
				species === 'cat' || species === 'dog' ? species : null;

			await savePet({
				name,
				species: localSpecies,
				breed,
				birth_date: useBirthDate ? date : null,
				weight: weight ? Number(weight) : null,
				health_notes: healthNotes,
			});

			showMessage({
				message: 'Pet cadastrado com sucesso',
				type: 'success',
			});

			router.back();
		} catch (error) {
			captureException({ error, showAlert: true });
		} finally {
			setIsSaving(false);
		}
	}, [name, species, breed, weight, healthNotes, date, useBirthDate, router]);

	const handleWeightChange = useCallback((value: string) => {
		const regex = /^-?\d*(\.\d*)?$/;
		if (regex.test(value)) {
			setWeight(value.trim());
		}
	}, []);

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

	return (
		<Container>
			<Header />

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
					value={weight?.toString()}
					onChangeText={handleWeightChange}
				/>

				<Input
					placeholder="Observações"
					multiline
					numberOfLines={5}
					value={healthNotes}
					onChangeText={setHealthNotes}
				/>
				<Label>Adicionar data de nascimento</Label>

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

				<Button
					title="Salvar"
					onPress={handleSave}
					disabled={isSaving}
				/>
			</Content>

			<Padding />
		</Container>
	);
};

export default AddPet;
