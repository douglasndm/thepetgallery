import styled from 'styled-components/native';
import { Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export const Container = styled.ScrollView.attrs(() => ({
	contentInsetAdjustmentBehavior: 'automatic',
	alwaysBounceVertical: true,
	contentContainerStyle: {
		flexGrow: 1,
	},
}))`
	background-color: #eef0f3;
`;

export const HeroCard = styled(Surface).attrs(() => ({
	elevation: 2,
}))`
	margin: 0 20px 18px;
	background-color: #ffffff;
	border-radius: 28px;
	padding: 24px 20px;
	align-items: center;
`;

export const Name = styled.Text`
	font-size: 28px;
	font-weight: 800;
	color: #000;
	margin-bottom: 10px;
	text-align: center;
`;

export const Subtitle = styled.Text`
	font-size: 15px;
	line-height: 22px;
	color: #666d77;
	text-align: center;
`;

export const Content = styled.View`
	margin: 0 20px 24px;
`;

export const InfoCard = styled(Surface).attrs(() => ({
	elevation: 1,
}))`
	background-color: #ffffff;
	border-radius: 22px;
	padding: 18px 16px;
`;

export const InfoRow = styled.View`
	padding: 12px 0;
	border-bottom-width: 1px;
	border-bottom-color: #edf0f3;
`;

export const InfoLabel = styled.Text`
	font-size: 12px;
	font-weight: 800;
	letter-spacing: 0.5px;
	text-transform: uppercase;
	color: #8a8f97;
	margin-bottom: 5px;
`;

export const InfoValue = styled.Text`
	font-size: 16px;
	line-height: 22px;
	color: rgb(91, 91, 91);
`;

export const ActionButtonContainer = styled.TouchableOpacity`
	flex-direction: row;
	align-items: center;
	align-self: flex-end;
	margin-right: 20px;
	margin-bottom: 16px;
	background-color: #ffffff;
	padding: 12px 14px;
	border-radius: 16px;
`;

export const ActionButtonIcon = styled(Ionicons).attrs(() => ({
	size: 24,
	color: '#4d5158',
}))`
	margin-right: 6px;
`;

export const ActionButtonText = styled.Text`
	font-size: 14px;
	font-weight: 700;
	color: #202226;
`;
