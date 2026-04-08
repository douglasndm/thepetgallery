import styled from 'styled-components/native';
import { Surface } from 'react-native-paper';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export const Container = styled.ScrollView.attrs(() => ({
	contentInsetAdjustmentBehavior: 'automatic',
	alwaysBounceVertical: true,
	contentContainerStyle: {
		flexGrow: 1,
	},
}))`
	background-color: #e8e8ea;
`;

export const PetContainer = styled(Surface).attrs(() => ({
	elevation: 4,
}))`
	background-color: #ffffff;

	margin: 5px 20px 0;
	border-radius: 12px;
	padding: 15px;
`;

export const PetContent = styled.TouchableOpacity`
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
`;

export const TextContainer = styled.View``;

export const PetName = styled.Text`
	font-weight: bold;
	font-size: 16px;
	color: #000;
`;

export const PetBreed = styled.Text`
	color: rgb(134, 134, 134);
`;

export const Icon = styled(MaterialIcons).attrs(() => ({
	size: 25,
}))``;

export const EmptyListName = styled.Text`
	color: #000000;
	margin: 5px 10px;
`;

export const ActionButtonContainer = styled.TouchableOpacity`
	flex-direction: row;
	align-items: center;
	align-self: flex-end;
	margin-right: 25px;
	margin-bottom: 10px;
`;

export const ActionButtonIcon = styled(Ionicons).attrs(() => ({
	size: 24,
}))`
	margin-right: 5px;
`;

export const ActionButtonText = styled.Text`
	font-size: 16px;
	font-weight: bold;
	color: #000000;
`;
