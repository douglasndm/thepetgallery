import React, { useState, useCallback, useEffect } from 'react';
import { Modal } from 'react-native';
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
import Loading from '@components/loading';

import DeleteVaccine from './delete';

import {
	Container,
	Hero,
	HeroTag,
	HeroTitle,
	HeroDescription,
	Content,
	Input,
	Section,
	DateContainer,
	DateTextContent,
	DateText,
	DateRemoveButton,
	DateRemoveIcon,
	Label,
	Footer,
	SubmitButton,
	SubmitButtonText,
	LoadingOverlay,
	CloseButton,
	Icon,
	ModalContent,
	DatePickerCard,
} from '../add/styles';

const VaccinesEdit: React.FC = () => {
	const router = useRouter();
	const { t } = useTranslation();
	const { petId, id } = useLocalSearchParams<{ petId: string; id: string }>();

	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
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

			setIsSaving(true);

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
			setIsSaving(false);
		}
	}, [
		petId,
		id,
		router,
		administeredDate,
		showUseDate,
		nextDoseDate,
		showUseNextDate,
		name,
		notes,
		t,
	]);

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

			<Hero>
				<HeroTag>{t('vaccines.editVaccine')}</HeroTag>
				<HeroTitle>{t('vaccines.editVaccine')}</HeroTitle>
				<HeroDescription>
					{t('vaccines.editDescription')}
				</HeroDescription>
			</Hero>

			<ActionButton
				onPress={() => setDeleteModalVisible(true)}
				title={t('vaccines.deleteVaccine')}
				iconName="trash"
				style={{ marginRight: 20, marginBottom: 16 }}
			/>
			{isLoading ? (
				<Loading />
			) : (
				<Content>
					<Section>
						<Label>{t('vaccines.namePlaceholder')}</Label>
						<Input
							placeholder={t('vaccines.namePlaceholder')}
							placeholderTextColor="#8b9097"
							value={name}
							onChangeText={setName}
						/>
					</Section>

					<Section>
						<Label>{t('vaccines.administeredDateLabel')}</Label>
						<DateContainer>
							<DateTextContent
								onPress={switchAdministeredDateModal}
							>
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
					</Section>

					<Section>
						<Label>{t('vaccines.nextDoseDateLabel')}</Label>
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
					</Section>

					<Section>
						<Label>{t('vaccines.notesPlaceholder')}</Label>
						<Input
							placeholder={t('vaccines.notesPlaceholder')}
							placeholderTextColor="#8b9097"
							multiline
							numberOfLines={5}
							textAlignVertical="top"
							style={{ minHeight: 120 }}
							value={notes}
							onChangeText={setNotes}
						/>
					</Section>

					<Footer>
						<SubmitButton
							onPress={handleUpdate}
							disabled={isSaving}
						>
							<SubmitButtonText>
								{t('vaccines.editVaccine')}
							</SubmitButtonText>
						</SubmitButton>
					</Footer>
				</Content>
			)}

			{isSaving && (
				<LoadingOverlay>
					<Loading />
				</LoadingOverlay>
			)}

			<Modal visible={isModalAdministeredDateVisible}>
				<CloseButton onPress={switchAdministeredDateModal}>
					<Icon name="close" />
				</CloseButton>
				<ModalContent>
					<Label>{t('vaccines.administeredDateLabel')}</Label>
					<DatePickerCard>
						<DatePicker
							mode="single"
							date={administeredDate}
							onChange={change => {
								if (change.date) {
									setAdministeredDate(
										new Date(String(change.date))
									);

									setShowUseDate(true);
								}
							}}
						/>
					</DatePickerCard>
				</ModalContent>
			</Modal>

			<Modal visible={isModalNextDateVisible}>
				<CloseButton onPress={switchNextDateModal}>
					<Icon name="close" />
				</CloseButton>
				<ModalContent>
					<Label>{t('vaccines.nextDoseDateLabel')}</Label>
					<DatePickerCard>
						<DatePicker
							mode="single"
							date={nextDoseDate}
							onChange={change => {
								if (change.date) {
									setNextDoseDate(
										new Date(String(change.date))
									);

									setShowUseNextDate(true);
								}
							}}
						/>
					</DatePickerCard>
				</ModalContent>
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
