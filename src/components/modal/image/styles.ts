import styled from 'styled-components/native';
import { Image } from 'expo-image';

export const ImageModal = styled.Modal`
	z-index: 1;
`;

export const Container = styled.View`
	flex: 1;
	background-color: #000;
`;

export const LoadingContainer = styled.View`
	align-items: center;
	justify-content: center;

	width: 100%;
	height: 100%;

	position: absolute;
	z-index: 2;
`;

export const Loading = styled.ActivityIndicator``;

export const CloseButton = styled.TouchableOpacity`
	top: 40px;
	right: 15px;
	padding: 15px;

	position: absolute;
	z-index: 10;
`;

export const CloseButtonText = styled.Text`
	color: #fff;
	font-size: 24px;
`;

export const ImageContainer = styled.View`
	flex: 1;

	justify-content: center;
	align-items: center;
`;

export const ImageView = styled(Image).attrs(() => ({
	resizeMode: 'contain',
}))`
	width: 100%;
	height: 75%;
`;

export const Button = styled.TouchableOpacity`
	//background-color: #f8cdb9;
	padding: 15px;
	border-radius: 12px;
`;

export const Text = styled.Text`
	color: #fff;
	font-weight: bold;
	font-size: 18px;
`;
