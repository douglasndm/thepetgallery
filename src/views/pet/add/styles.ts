import styled from 'styled-components/native';
import { Surface } from 'react-native-paper';

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
	background-color: #f7e6de;
	color: #8a5a47;
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

export const Label = styled.Text`
	font-size: 14px;
	font-weight: 700;
	color: #26272b;
	margin-bottom: 10px;
`;

export const Section = styled.View`
	margin-bottom: 18px;
`;

export const DatePickerCard = styled.View`
	border-radius: 18px;
	background-color: #fbfbfc;
	padding: 6px;
	border: 1px solid #eceff3;
`;

export const Footer = styled.View`
	margin-top: 8px;
`;

export const SubmitButton = styled.TouchableOpacity<{ disabled?: boolean }>`
	background-color: ${({ disabled }) => (disabled ? '#d2b8aa' : '#c98767')};
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
