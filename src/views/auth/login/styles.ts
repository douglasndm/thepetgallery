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

export const LoginContainer = styled.View`
	align-items: center;
`;

export const LoginButton = styled.TouchableOpacity`
	width: 160px;
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
}))``;
