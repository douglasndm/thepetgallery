import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import RadioGroup, { RadioButtonProps } from 'react-native-radio-buttons-group';
import DateTimePicker from 'react-native-ui-datepicker';
import { showMessage } from 'react-native-flash-message';
import { useTranslation } from 'react-i18next';

import { captureException } from '@services/exceptionsHandler';

import { savePet } from '@utils/pets/save';

import Header from '@components/header';
import Padding from '@components/padding';
import Button from '@components/button';

import { Container, Content, Input, Label } from './styles';

const AddPet: React.FC = () => {
	const router = useRouter();
	const { t } = useTranslation();

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
				message: t('pets.createdSuccess'),
				type: 'success',
			});

			router.back();
		} catch (error) {
			captureException({ error, showAlert: true });
		} finally {
			setIsSaving(false);
		}
	}, [
		name,
		species,
		breed,
		weight,
		healthNotes,
		date,
		useBirthDate,
		router,
		t,
	]);

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
				label: t('pets.dog'),
				value: 'dog',
			},
			{
				id: 'cat',
				label: t('pets.cat'),
				value: 'cat',
			},
			{
				id: 'null',
				label: t('pets.other'),
				value: undefined,
			},
		],
		[t]
	);

	const useBirthDateRadioButtons: RadioButtonProps[] = useMemo(
		() => [
			{
				id: 'yes',
				label: t('common.yes'),
				value: 'yes',
			},
			{
				id: 'no',
				label: t('common.no'),
				value: 'no',
			},
		],
		[t]
	);

	return (
		<Container>
			<Header />

			<Content>
				<Input
					placeholder={t('pets.namePlaceholder')}
					value={name}
					onChangeText={setName}
				/>

				<Label>{t('pets.speciesLabel')}</Label>

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
					placeholder={t('pets.breedPlaceholder')}
					value={breed}
					onChangeText={setBreed}
				/>
				<Input
					placeholder={t('pets.weightPlaceholder')}
					keyboardType="numeric"
					value={weight?.toString()}
					onChangeText={handleWeightChange}
				/>

				<Input
					placeholder={t('pets.notesPlaceholder')}
					multiline
					numberOfLines={5}
					value={healthNotes}
					onChangeText={setHealthNotes}
				/>
				<Label>{t('pets.addBirthDateLabel')}</Label>

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
						<Label>{t('pets.birthDateLabel')}</Label>

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
					title={t('common.save')}
					onPress={handleSave}
					disabled={isSaving}
				/>
			</Content>

			<Padding />
		</Container>
	);
};

export default AddPet;
