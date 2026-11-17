import styled from 'styled-components/native';
import { StyleSheet } from 'react-native';

export const lottieStyle = StyleSheet.create({
	lottie: {
		...(StyleSheet.absoluteFill as object),
		backgroundColor: '#f8cdb9',
	},
});

export const PhotoContainer = styled.Pressable`
	width: 100%;
	height: 100%;
`;
