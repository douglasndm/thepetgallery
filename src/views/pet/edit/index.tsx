import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import RadioGroup, { RadioButtonProps } from 'react-native-radio-buttons-group';
import DateTimePicker from 'react-native-ui-datepicker';
import { showMessage } from 'react-native-flash-message';
import { useTranslation } from 'react-i18next';

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
	const { t } = useTranslation();
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
					message: t('pets.updatedSuccess'),
					type: 'success',
				});

				router.back();
			}
		} catch (error) {
			captureException({ error, showAlert: true });
		} finally {
			setIsLoading(false);
		}
	}, [
		name,
		species,
		breed,
		weight,
		healthNotes,
		useBirthDate,
		date,
		router,
		id,
		t,
	]);

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
				title={t('pets.deletePet')}
				onPress={() => setShowDeleteDialog(true)}
			/>

			{isLoading ? (
				<Loading />
			) : (
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
						value={weight}
						onChangeText={handleWeightChange}
					/>

					<Input
						placeholder={t('pets.notesPlaceholder')}
						multiline
						numberOfLines={5}
						value={healthNotes}
						onChangeText={setHealthNotes}
					/>

					<Label>{t('pets.editBirthDateLabel')}</Label>
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

					<Button title={t('common.save')} onPress={handleUpdate} />
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
