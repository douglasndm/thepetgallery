import styled from 'styled-components/native';

export const Container = styled.View`
	flex: 1;
	background-color: #e8e8ea;
`;

export const PageContent = styled.View`
	padding: 0 20px;
`;

export const TextTitle = styled.Text`
	font-size: 20px;
	font-weight: bold;
	color: #000;
	text-align: center;
	margin-bottom: 20px;
`;

export const TextDescription = styled.Text`
	color: #000;
	font-size: 16px;
	margin-bottom: 20px;
`;

export const FormCard = styled.View`
	background-color: #ffffff;
	border-radius: 12px;
	padding: 16px;
	margin-bottom: 24px;
`;

export const ModeSelector = styled.View`
	flex-direction: row;
	background-color: #f2f2f4;
	border-radius: 10px;
	padding: 4px;
	margin-bottom: 16px;
`;

export const ModeButton = styled.TouchableOpacity<{ active: boolean }>`
	flex: 1;
	padding: 10px 12px;
	border-radius: 8px;
	background-color: ${({ active }) => (active ? '#d3977b' : 'transparent')};
`;

export const ModeButtonText = styled.Text<{ active: boolean }>`
	text-align: center;
	font-size: 14px;
	font-weight: 600;
	color: ${({ active }) => (active ? '#ffffff' : '#444444')};
`;

export const FieldLabel = styled.Text`
	color: #000000;
	font-size: 14px;
	font-weight: 600;
	margin-bottom: 8px;
`;

export const Input = styled.TextInput`
	border: 1px solid rgba(0, 0, 0, 0.12);
	border-radius: 8px;
	padding: 12px 14px;
	margin-bottom: 14px;
	color: #000000;
	background-color: #ffffff;
`;

export const PrimaryButton = styled.TouchableOpacity`
	background-color: #d3977b;
	border-radius: 8px;
	padding: 14px 16px;
	align-items: center;
	justify-content: center;
`;

export const PrimaryButtonText = styled.Text`
	color: #ffffff;
	font-size: 15px;
	font-weight: 700;
`;

export const SecondaryActionButton = styled.TouchableOpacity`
	padding: 12px 8px 4px;
	align-self: center;
`;

export const SecondaryActionText = styled.Text`
	color: #8d5f49;
	font-size: 14px;
	font-weight: 600;
`;

export const LoginContainer = styled.View`
	align-items: center;
	padding-bottom: 24px;
`;

export const LoginButton = styled.TouchableOpacity`
	width: 220px;
	height: 45px;
	background-color: #ffffff;
	border-radius: 8px;
	border-width: 1px;
	border-color: #d9d9d9;
	align-items: center;
	justify-content: center;
	margin-top: 10px;
`;

export const LoginButtonText = styled.Text`
	color: #000000;
	font-size: 14px;
	font-weight: 600;
`;

export const Loading = styled.ActivityIndicator.attrs(() => ({
	size: 'large',
	color: '#f8cdb9',
	marginBottom: 24,
}))``;
