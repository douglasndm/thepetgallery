import React, { useState, useCallback } from 'react';
import { Modal, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import DatePicker from 'react-native-ui-datepicker';
import { useTranslation } from 'react-i18next';

import { captureException } from '@services/exceptionsHandler';

import { formatDate } from '@utils/data';
import { saveVaccine } from '@utils/vaccines/save';

import Header from '@components/header';
import Button from '@components/button';
import Loading from '@components/loading';

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
	}, [petId, router, administeredDate, showUseDate, nextDoseDate, showUseNextDate, name, notes, t]);

	const switchAdministeredDateModal = useCallback(() => {
		setIsModalAdministeredDateVisible(prevValue => !prevValue);
	}, []);

	const switchNextDateModal = useCallback(() => {
		setIsModalNextDateVisible(prevValue => !prevValue);
	}, []);

	return (
		<Container>
			<Header />

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

					<Button title={t('vaccines.addVaccine')} onPress={handleSave} />
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
		</Container>
	);
};

export default VaccinesAdd;
