import React, { useState, useCallback, useEffect } from 'react';
import { Modal, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, collection } from '@react-native-firebase/firestore';
import { showMessage } from 'react-native-flash-message';
import DatePicker from 'react-native-ui-datepicker';
import { useTranslation } from 'react-i18next';

import { getUserPetsReference } from '@services/firebase/firestore';
import { captureException } from '@services/exceptionsHandler';

import { formatDate } from '@utils/data';

import Header from '@components/header';
import ActionButton from '@components/actionButton';
import Button from '@components/button';
import Loading from '@components/loading';

import DeleteVaccine from './delete';

import {
	Container,
	Content,
	Input,
	DateContainer,
	DateTextContent,
	DateText,
	DateRemoveButton,
	DateRemoveIcon,
	Label,
	CloseButton,
	Icon,
} from '../add/styles';

const VaccinesEdit: React.FC = () => {
	const router = useRouter();
	const { t } = useTranslation();
	const { petId, id } = useLocalSearchParams<{ petId: string; id: string }>();

	const [isLoading, setIsLoading] = useState(false);
	const [isModalAdministeredDateVisible, setIsModalAdministeredDateVisible] =
		useState(false);
	const [isModalNextDateVisible, setIsModalNextDateVisible] = useState(false);

	const [showUseDate, setShowUseDate] = useState(false);
	const [showUseNextDate, setShowUseNextDate] = useState(false);

	const [deleteModalVisible, setDeleteModalVisible] = useState(false);

	const [name, setName] = useState('');
	const [administeredDate, setAdministeredDate] = useState<Date>(new Date());
	const [nextDoseDate, setNextDoseDate] = useState<Date>(new Date());
	const [notes, setNotes] = useState('');

	const handleUpdate = useCallback(async () => {
		if (!petId || !id) {
			return;
		}

		try {
			if (name.trim() === '') {
				return showMessage({
					message: t('vaccines.nameRequired'),
					type: 'warning',
				});
			}

			setIsLoading(true);

			const petsReference = await getUserPetsReference();

			if (petsReference) {
				const petDoc = doc(petsReference, petId);
				const vaccinesCollection = collection(petDoc, 'vaccines');

				await vaccinesCollection.doc(id).set({
					name,
					date_administered: showUseDate ? administeredDate : null,
					next_dose_date: showUseNextDate ? nextDoseDate : null,
					notes,
				});

				showMessage({
					message: t('vaccines.updatedSuccess'),
					type: 'success',
				});

				router.back();
			}
		} catch (error) {
			captureException({
				error,
				showAlert: true,
			});
		} finally {
			setIsLoading(false);
		}
	}, [petId, id, router, administeredDate, showUseDate, nextDoseDate, showUseNextDate, name, notes, t]);

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

				const vac = await vaccinesCollection.doc(id).get();

				if (vac.exists) {
					const data = vac.data();

					if (!data) return;

					setName(data.name);
					setNotes(data.notes);

					if (data.date_administered) {
						setShowUseDate(true);
						setAdministeredDate(data.date_administered.toDate());
					}

					if (data.next_dose_date) {
						setShowUseNextDate(true);
						setNextDoseDate(data.next_dose_date.toDate());
					}
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

	const switchAdministeredDateModal = useCallback(() => {
		setIsModalAdministeredDateVisible(prevValue => !prevValue);
	}, []);

	const switchNextDateModal = useCallback(() => {
		setIsModalNextDateVisible(prevValue => !prevValue);
	}, []);

	return (
		<Container>
			<Header />

			<ActionButton
				onPress={() => setDeleteModalVisible(true)}
				title={t('vaccines.deleteVaccine')}
				iconName="trash"
			/>
			{isLoading ? (
				<Loading />
			) : (
				<Content>
					<Input
						placeholder={t('vaccines.namePlaceholder')}
						value={name}
						onChangeText={setName}
					/>

					<DateContainer>
						<DateTextContent onPress={switchAdministeredDateModal}>
							<DateText>
								{showUseDate
									? formatDate(administeredDate)
									: t('vaccines.addAdministeredDate')}
							</DateText>
						</DateTextContent>

						{showUseDate && (
							<DateRemoveButton
								onPress={() => {
									setAdministeredDate(new Date());
									setShowUseDate(false);
								}}
							>
								<DateRemoveIcon name="close-outline" />
							</DateRemoveButton>
						)}
					</DateContainer>

					<DateContainer>
						<DateTextContent onPress={switchNextDateModal}>
							<DateText>
								{showUseNextDate
									? formatDate(nextDoseDate)
									: t('vaccines.addNextDoseDate')}
							</DateText>
						</DateTextContent>

						{showUseNextDate && (
							<DateRemoveButton
								onPress={() => {
									setNextDoseDate(new Date());
									setShowUseNextDate(false);
								}}
							>
								<DateRemoveIcon name="close-outline" />
							</DateRemoveButton>
						)}
					</DateContainer>

					<Input
						placeholder={t('vaccines.notesPlaceholder')}
						multiline
						value={notes}
						onChangeText={setNotes}
					/>

					<Button title={t('vaccines.editVaccine')} onPress={handleUpdate} />
				</Content>
			)}

			<Modal visible={isModalAdministeredDateVisible}>
				<CloseButton onPress={switchAdministeredDateModal}>
					<Icon name="close" />
				</CloseButton>
				<View
					style={{
						flex: 1,
						justifyContent: 'center',
					}}
				>
					<Label>{t('vaccines.administeredDateLabel')}</Label>
					<DatePicker
						mode="single"
						date={administeredDate}
						onChange={change => {
							if (change.date) {
								setAdministeredDate(new Date(String(change.date)));

								setShowUseDate(true);
							}
						}}
					/>
				</View>
			</Modal>

			<Modal visible={isModalNextDateVisible}>
				<CloseButton onPress={switchNextDateModal}>
					<Icon name="close" />
				</CloseButton>
				<View
					style={{
						flex: 1,
						justifyContent: 'center',
					}}
				>
					<Label>{t('vaccines.nextDoseDateLabel')}</Label>
					<DatePicker
						mode="single"
						date={nextDoseDate}
						onChange={change => {
							if (change.date) {
								setNextDoseDate(new Date(String(change.date)));

								setShowUseNextDate(true);
							}
						}}
					/>
				</View>
			</Modal>

			<DeleteVaccine
				visible={deleteModalVisible}
				setVisible={setDeleteModalVisible}
				petId={petId ?? ''}
				vaccineId={id ?? ''}
			/>
		</Container>
	);
};

export default VaccinesEdit;
