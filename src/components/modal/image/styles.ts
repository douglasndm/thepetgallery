import styled from 'styled-components/native';
import { Image } from 'expo-image';
import Ionicons from '@react-native-vector-icons/ionicons/static';

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
	top: 56px;
	right: 20px;
	width: 40px;
	height: 40px;
	border-radius: 20px;
	align-items: center;
	justify-content: center;
	background-color: rgba(255, 255, 255, 0.18);

	position: absolute;
	z-index: 10;
`;

export const CloseIcon = styled(Ionicons).attrs(() => ({
	size: 24,
	color: '#fff',
}))``;

export const ImageContainer = styled.View`
	flex: 1;

	justify-content: center;
	align-items: center;
`;

export const ImageView = styled(Image).attrs(() => ({
	contentFit: 'contain',
}))`
	width: 100%;
	height: 75%;
`;

export const Button = styled.TouchableOpacity`
	margin-top: 12px;
	padding: 14px 28px;
	border-radius: 18px;
	background-color: #c98767;
`;

export const Text = styled.Text`
	color: #fff;
	font-weight: 800;
	font-size: 16px;
`;

export const Hint = styled.View`
	width: 40px;
	height: 4px;
	border-radius: 2px;
	margin-top: 16px;
	background-color: rgba(255, 255, 255, 0.35);
`;
