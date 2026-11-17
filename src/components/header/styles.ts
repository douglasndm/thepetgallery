import styled from 'styled-components/native';
import Ionicons from '@react-native-vector-icons/ionicons/static';

import { colors } from '@app/theme';

export const Container = styled.View`
	background-color: ${colors.background};
	margin-bottom: 8px;
`;

export const Bar = styled.View`
	height: 56px;
	flex-direction: row;
	align-items: center;
	padding: 0 12px;
`;

export const Side = styled.View`
	width: 44px;
	align-items: flex-start;
`;

export const BackButton = styled.TouchableOpacity`
	width: 40px;
	height: 40px;
	border-radius: 20px;
	align-items: center;
	justify-content: center;
	background-color: ${colors.surface};
`;

export const BackIcon = styled(Ionicons).attrs(() => ({
	size: 22,
	color: colors.text,
}))``;

export const Content = styled.Pressable`
	flex: 1;
	flex-direction: row;
	align-items: center;
	justify-content: center;
`;

export const AppTitle = styled.Text`
	font-size: 17px;
	font-weight: 700;
	color: ${colors.text};
`;
