import React, { useState, useCallback, useEffect } from 'react';
import { Modal, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, collection } from '@react-native-firebase/firestore';
import { showMessage } from 'react-native-flash-message';
import DatePicker from 'react-native-ui-datepicker';

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
					message: 'Por favor, informe o nome da vacina.',
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
					message: 'Vacina atualizada com sucesso.',
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
	}, [petId, id, router, administeredDate, showUseDate, nextDoseDate, showUseNextDate, name, notes]);

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
				title="Excluir vacina"
				iconName="trash"
			/>
			{isLoading ? (
				<Loading />
			) : (
				<Content>
					<Input
						placeholder="Nome da vacina"
						value={name}
						onChangeText={setName}
					/>

					<DateContainer>
						<DateTextContent onPress={switchAdministeredDateModal}>
							<DateText>
								{showUseDate
									? formatDate(administeredDate)
									: 'Adicionar data da aplicação'}
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
									: 'Adicionar proxima dose'}
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
						placeholder="Observações"
						multiline
						value={notes}
						onChangeText={setNotes}
					/>

					<Button title="Atualizar vacina" onPress={handleUpdate} />
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
					<Label>Data da aplicação</Label>
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
					<Label>Data da próxima dose</Label>
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
