import styled from 'styled-components/native';
import { Surface } from 'react-native-paper';

export const Container = styled.ScrollView.attrs(() => ({
	contentInsetAdjustmentBehavior: 'automatic',
	alwaysBounceVertical: true,
	contentContainerStyle: {
		flexGrow: 1,
	},
}))`
	background-color: #e8e8ea;
`;

export const Content = styled(Surface).attrs(() => ({
	elevation: 1,
}))`
	margin: 20px 10px;
	background-color: #ffffff;
	border-radius: 12px;
	padding: 15px;
`;

export const Name = styled.Text`
	font-size: 22px;
	font-weight: bold;
	color: #000;
`;

export const MoreInfo = styled.Text`
	font-size: 16px;
	color: rgb(91, 91, 91);
`;
