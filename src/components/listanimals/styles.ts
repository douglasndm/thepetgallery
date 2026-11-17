import styled from 'styled-components/native';
import { Dimensions } from 'react-native';
import { Image } from 'expo-image';

import { colors, radius } from '@app/theme';

const cardWidth = Dimensions.get('window').width - 40;

export const Container = styled.View`
	width: ${cardWidth}px;
	height: ${cardWidth * 1.25}px;
	align-self: center;
	margin-bottom: 20px;
	border-radius: ${radius.lg}px;
	overflow: hidden;
	background-color: ${colors.placeholder};
	shadow-color: #000;
	shadow-opacity: 0.12;
	shadow-radius: 12px;
	shadow-offset: 0px 6px;
	elevation: 4;
`;

export const Photo = styled(Image).attrs(() => ({
	contentFit: 'cover',
	transition: 200,
}))`
	width: 100%;
	height: 100%;
`;
