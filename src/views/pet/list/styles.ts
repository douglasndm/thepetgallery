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

export const PetContainer = styled(Surface).attrs(() => ({
	elevation: 2,
}))`
	background-color: #ffffff;
	margin: 0 20px 12px;
	border-radius: 22px;
	padding: 18px 16px;
`;

export const PetContent = styled.TouchableOpacity`
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
`;

export const TextContainer = styled.View`
	flex: 1;
`;

export const PetMetaRow = styled.View`
	flex-direction: row;
	align-items: center;
	margin-bottom: 10px;
`;

export const PetBadge = styled.View`
	background-color: #f6e3da;
	padding: 7px 10px;
	border-radius: 999px;
	margin-right: 10px;
`;

export const PetBadgeText = styled.Text`
	font-size: 12px;
	font-weight: 700;
	color: #8a5a47;
	text-transform: uppercase;
`;

export const PetName = styled.Text`
	font-weight: 800;
	font-size: 18px;
	color: #131313;
	margin-bottom: 4px;
`;

export const PetBreed = styled.Text`
	color: #696f79;
	font-size: 14px;
`;

export const Icon = styled(MaterialCommunityIcons).attrs(() => ({
	size: 28,
	color: '#5b4337',
}))`
	margin-left: 14px;
`;

export const Chevron = styled(Ionicons).attrs(() => ({
	name: 'chevron-forward',
	size: 18,
	color: '#9aa0a9',
}))`
	margin-left: 10px;
`;

export const EmptyListName = styled.Text`
	color: #5f6570;
	margin-top: 10px;
	font-size: 15px;
	line-height: 22px;
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
	name: 'paw-outline',
	size: 36,
	color: '#b18a77',
}))`
	margin-bottom: 12px;
`;

export const ActionButtonContainer = styled.TouchableOpacity`
	flex-direction: row;
	align-items: center;
	align-self: flex-start;
	margin: 0 20px 18px;
	background-color: #c98767;
	padding: 14px 18px;
	border-radius: 18px;
`;

export const ActionButtonIcon = styled(Ionicons).attrs(() => ({
	size: 24,
	color: '#ffffff',
}))`
	margin-right: 8px;
`;

export const ActionButtonText = styled.Text`
	font-size: 15px;
	font-weight: 800;
	color: #ffffff;
`;
