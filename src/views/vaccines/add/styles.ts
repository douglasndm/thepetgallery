import styled from 'styled-components/native';
import { Surface } from 'react-native-paper';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export const Container = styled.ScrollView.attrs(() => ({
	contentInsetAdjustmentBehavior: 'automatic',
	alwaysBounceVertical: true,
	contentContainerStyle: {
		flexGrow: 1,
		paddingBottom: 32,
	},
}))`
	background-color: #eef0f3;
`;

export const Hero = styled.View`
	padding: 0 20px 18px;
`;

export const HeroTag = styled.Text`
	align-self: flex-start;
	background-color: #e8edf7;
	color: #55667f;
	font-size: 12px;
	font-weight: 700;
	letter-spacing: 0.6px;
	text-transform: uppercase;
	padding: 8px 10px;
	border-radius: 999px;
	margin-bottom: 12px;
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
	color: #5a5f68;
`;

export const Content = styled(Surface).attrs(() => ({
	elevation: 2,
}))`
	background-color: #ffffff;
	border-radius: 24px;
	margin: 0 20px;
	padding: 18px 16px 20px;
`;

export const Input = styled.TextInput`
	border: 1px solid #dde2e7;
	border-radius: 16px;
	padding: 14px 16px;
	color: #111111;
	font-size: 15px;
	background-color: #fbfbfc;
	margin-bottom: 14px;
`;

export const Section = styled.View`
	margin-bottom: 18px;
`;

export const DateContainer = styled.View`
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	border: 1px solid #e7ebf0;
	background-color: #fbfbfc;
	border-radius: 18px;
	padding: 16px 14px;
	margin-bottom: 12px;
`;

export const DateTextContent = styled.TouchableOpacity`
	flex: 1;
`;

export const DateText = styled.Text`
	font-size: 14px;
	line-height: 20px;
	color: #23262b;
`;

export const DateRemoveButton = styled.TouchableOpacity`
	margin-left: 12px;
	background-color: #f1f3f6;
	width: 32px;
	height: 32px;
	border-radius: 999px;
	align-items: center;
	justify-content: center;
`;

export const DateRemoveIcon = styled(Ionicons).attrs(() => ({
	size: 20,
	name: 'close-outline',
	color: '#555d68',
}))``;

export const Label = styled.Text`
	font-size: 14px;
	font-weight: 700;
	color: #26272b;
	margin-bottom: 10px;
`;

export const Footer = styled.View`
	margin-top: 8px;
`;

export const SubmitButton = styled.TouchableOpacity<{ disabled?: boolean }>`
	background-color: ${({ disabled }) => (disabled ? '#b9c3d3' : '#7f95b5')};
	border-radius: 18px;
	min-height: 54px;
	align-items: center;
	justify-content: center;
`;

export const SubmitButtonText = styled.Text`
	color: #ffffff;
	font-size: 15px;
	font-weight: 800;
`;

export const LoadingOverlay = styled.View`
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	background-color: rgba(238, 240, 243, 0.76);
	align-items: center;
	justify-content: center;
	padding: 24px;
	z-index: 5;
`;

export const CloseButton = styled.TouchableOpacity`
	margin-top: ${initialWindowMetrics?.insets.top}px;
	align-self: flex-end;
	background-color: #ffffff;
	width: 44px;
	height: 44px;
	border-radius: 999px;
	align-items: center;
	justify-content: center;
	margin-right: 12px;
`;

export const Icon = styled(Ionicons).attrs(() => ({
	size: 26,
	color: '#31343a',
}))``;

export const ModalContent = styled.View`
	flex: 1;
	justify-content: center;
	padding: 0 16px 24px;
	background-color: #eef0f3;
`;

export const DatePickerCard = styled.View`
	border-radius: 24px;
	background-color: #ffffff;
	padding: 16px 10px 10px;
`;
