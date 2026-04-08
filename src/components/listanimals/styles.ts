import styled from 'styled-components/native';
import { Dimensions } from 'react-native';
import { Image } from 'expo-image';

export const Container = styled.View`
	width: 100%;
	height: 500px;

	margin-bottom: 10px;

	background-color: pink;
	align-items: center;
`;

export const Photo = styled(Image)`
	width: ${Dimensions.get('window').width}px;
	height: 500px;
`;
