import styled from 'styled-components/native';
import Ionicons from '@react-native-vector-icons/ionicons';

export const Container = styled.View`
	flex-direction: row;
	align-items: center;
	padding: 0 20px;
`;

export const Content = styled.Pressable`
	justify-content: center;
	align-items: center;
	flex-direction: row;
	flex: 1;
`;

export const TextContainer = styled.View`
	padding: 20px 0;
`;

export const AppTitle = styled.Text`
	font-size: 18px;
	text-align: center;
	color: #737573;
`;

export const ButtonIcon = styled.TouchableOpacity``;

export const Icon = styled(Ionicons).attrs(() => ({
	size: 30,
}))``;
