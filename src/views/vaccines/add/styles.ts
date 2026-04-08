import styled from 'styled-components/native';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export const Container = styled.ScrollView.attrs(() => ({
	contentInsetAdjustmentBehavior: 'automatic',
	alwaysBounceVertical: true,
	contentContainerStyle: {
		flexGrow: 1,
	},
}))``;

export const Content = styled.View`
	background-color: #ffffff;
	border-radius: 12px;
	margin: 0 20px;
	padding: 15px;
`;

export const Input = styled.TextInput`
	margin: 0 10px 10px;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 8px;
	padding: 10px;
	color: #000;
`;

export const DateContainer = styled.View`
	flex-direction: row;
	justify-content: space-between;

	align-items: center;
	margin: 5px 15px;
`;

export const DateTextContent = styled.TouchableOpacity``;

export const DateText = styled.Text`
	font-size: 14px;
`;

export const DateRemoveButton = styled.TouchableOpacity``;

export const DateRemoveIcon = styled(Ionicons).attrs(() => ({
	size: 23,
	name: 'close-outline',
}))``;

export const Label = styled.Text`
	font-size: 15px;
	font-weight: bold;
	color: #000000;
	margin: 15px 10px;
`;

export const CloseButton = styled.TouchableOpacity`
	margin-top: ${initialWindowMetrics?.insets.top}px;
`;

export const Icon = styled(Ionicons).attrs(() => ({
	size: 35,
}))`
	align-self: flex-end;
	margin: 0 10px;
`;
