import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

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
