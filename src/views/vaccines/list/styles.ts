import styled from 'styled-components/native';
import { Surface } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export const Container = styled.ScrollView.attrs(() => ({
	contentInsetAdjustmentBehavior: 'automatic',
	alwaysBounceVertical: true,
	contentContainerStyle: {
		flexGrow: 1,
	},
}))`
	background-color: #eef0f3;
`;

export const Hero = styled.View`
	padding: 0 20px 20px;
`;

export const HeroTitle = styled.Text`
	font-size: 28px;
	line-height: 34px;
	font-weight: 800;
	color: #151515;
	margin-bottom: 8px;
`;

export const HeroDescription = styled.Text`
	font-size: 15px;
	line-height: 22px;
	color: #616772;
`;

export const VaccineContainer = styled(Surface).attrs(() => ({
	elevation: 2,
}))`
	background-color: #ffffff;
	margin: 0 20px 12px;
	border-radius: 22px;
	padding: 18px 16px;
`;

export const VaccineContent = styled.TouchableOpacity`
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
`;

export const TextContainer = styled.View`
	flex: 1;
`;

export const VaccineTag = styled.View`
	align-self: flex-start;
	background-color: #e5edf8;
	padding: 7px 10px;
	border-radius: 999px;
	margin-bottom: 10px;
`;

export const VaccineTagText = styled.Text`
	font-size: 12px;
	font-weight: 700;
	color: #566c8a;
	text-transform: uppercase;
`;

export const VaccineName = styled.Text`
	font-weight: 800;
	font-size: 18px;
	color: #131313;
	margin-bottom: 4px;
`;

export const VaccineDate = styled.Text`
	color: #696f79;
	font-size: 14px;
`;

export const Chevron = styled(Ionicons).attrs(() => ({
	name: 'chevron-forward',
	size: 18,
	color: '#9aa0a9',
}))`
	margin-left: 10px;
`;

export const EmptyStateCard = styled(Surface).attrs(() => ({
	elevation: 1,
}))`
	background-color: #ffffff;
	margin: 12px 20px 0;
	border-radius: 24px;
	padding: 24px 20px;
	align-items: center;
`;

export const EmptyStateIcon = styled(MaterialCommunityIcons).attrs(() => ({
	name: 'needle-off',
	size: 36,
	color: '#7991b5',
}))`
	margin-bottom: 12px;
`;

export const EmptyStateText = styled.Text`
	color: #5f6570;
	font-size: 15px;
	line-height: 22px;
	text-align: center;
`;
