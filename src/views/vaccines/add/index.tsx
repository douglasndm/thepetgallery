import React, { useState, useCallback } from 'react';
import { Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import DatePicker from 'react-native-ui-datepicker';
import { useTranslation } from 'react-i18next';

import { captureException } from '@services/exceptionsHandler';

import { formatDate } from '@utils/data';
import { saveVaccine } from '@utils/vaccines/save';

import Header from '@components/header';
import Loading from '@components/loading';

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
} from './styles';

const VaccinesAdd: React.FC = () => {
	const router = useRouter();
	const { t } = useTranslation();
	const { petId } = useLocalSearchParams<{ petId: string }>();

	const [isLoading, setIsLoading] = useState(false);
	const [isModalAdministeredDateVisible, setIsModalAdministeredDateVisible] =
		useState(false);
	const [isModalNextDateVisible, setIsModalNextDateVisible] = useState(false);

	const [showUseDate, setShowUseDate] = useState(false);
	const [showUseNextDate, setShowUseNextDate] = useState(false);

	const [name, setName] = useState('');
	const [administeredDate, setAdministeredDate] = useState<Date>(new Date());
	const [nextDoseDate, setNextDoseDate] = useState<Date>(new Date());
	const [notes, setNotes] = useState('');

	const handleSave = useCallback(async () => {
		if (!petId) {
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

			await saveVaccine({
				petId,
				vaccine: {
					name: name.trim(),
					date_administered: showUseDate ? administeredDate : null,
					next_dose_date: showUseNextDate ? nextDoseDate : null,
					notes: notes.trim(),
				},
			});

			showMessage({
				message: t('vaccines.addedSuccess'),
				type: 'success',
			});

			router.back();
		} catch (error) {
			captureException({
				error,
				showAlert: true,
			});
		} finally {
			setIsLoading(false);
		}
	}, [
		petId,
		router,
		administeredDate,
		showUseDate,
		nextDoseDate,
		showUseNextDate,
		name,
		notes,
		t,
	]);

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
				<HeroTag>{t('vaccines.addVaccine')}</HeroTag>
				<HeroTitle>{t('vaccines.addVaccine')}</HeroTitle>
				<HeroDescription>
					{t('vaccines.addDescription')}
				</HeroDescription>
			</Hero>

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
					<SubmitButton onPress={handleSave} disabled={isLoading}>
						<SubmitButtonText>
							{t('vaccines.addVaccine')}
						</SubmitButtonText>
					</SubmitButton>
				</Footer>
			</Content>

			{isLoading && (
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
		</Container>
	);
};

export default VaccinesAdd;
