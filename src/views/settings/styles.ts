import styled from 'styled-components/native';
import { Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export const Container = styled.ScrollView.attrs(() => ({
	contentInsetAdjustmentBehavior: 'never',
	alwaysBounceVertical: true,
	contentContainerStyle: {
		flexGrow: 1,
		paddingBottom: 32,
	},
}))`
	background-color: #eef0f3;
`;

export const Hero = styled.View`
	padding: 20px 20px 18px;
`;

export const HeroTag = styled.Text`
	align-self: flex-start;
	background-color: #ece8f7;
	color: #5f5a86;
	font-size: 12px;
	font-weight: 700;
	letter-spacing: 0.6px;
	text-transform: uppercase;
	padding: 8px 10px;
	border-radius: 999px;
	margin-bottom: 12px;
`;

export const Title = styled.Text`
	font-size: 28px;
	font-weight: 800;
	line-height: 34px;
	margin-bottom: 8px;
	color: #000;
`;

export const Description = styled.Text`
	font-size: 15px;
	line-height: 22px;
	color: #5f6570;
`;

export const SectionCard = styled(Surface).attrs(() => ({
	elevation: 2,
}))`
	margin: 0 20px 16px;
	border-radius: 24px;
	padding: 18px 16px;
	background-color: #ffffff;
`;

export const SectionTitle = styled.Text`
	font-size: 12px;
	font-weight: 800;
	letter-spacing: 0.5px;
	text-transform: uppercase;
	color: #8a8f97;
	margin-bottom: 14px;
`;

export const ActionItem = styled.TouchableOpacity`
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 14px 0;
	border-bottom-width: 1px;
	border-bottom-color: #edf0f3;
`;

export const ActionLeft = styled.View`
	flex-direction: row;
	align-items: center;
	flex: 1;
	margin-right: 12px;
`;

export const ActionIconWrap = styled.View`
	width: 40px;
	height: 40px;
	border-radius: 14px;
	background-color: #f3f5f8;
	align-items: center;
	justify-content: center;
	margin-right: 12px;
`;

export const ActionIcon = styled(Ionicons).attrs(() => ({
	size: 20,
	color: '#4c5260',
}))``;

export const ActionTexts = styled.View`
	flex: 1;
`;

export const ActionTitle = styled.Text`
	font-size: 15px;
	font-weight: 700;
	color: #16181c;
	margin-bottom: 2px;
`;

export const ActionSubtitle = styled.Text`
	font-size: 13px;
	line-height: 18px;
	color: #707782;
`;

export const Chevron = styled(Ionicons).attrs(() => ({
	name: 'chevron-forward',
	size: 18,
	color: '#9aa0a9',
}))``;

export const LanguageButton = styled.TouchableOpacity<{ active?: boolean }>`
	padding: 14px 16px;
	border-radius: 18px;
	background-color: ${({ active }) => (active ? '#dfe7f5' : '#f7f8fa')};
	border: 1px solid ${({ active }) => (active ? '#c0cce2' : '#ebedf1')};
	margin-bottom: 10px;
`;

export const LanguageTitle = styled.Text<{ active?: boolean }>`
	font-size: 15px;
	font-weight: 700;
	color: ${({ active }) => (active ? '#425570' : '#202226')};
`;

export const LanguageSubtitle = styled.Text<{ active?: boolean }>`
	font-size: 13px;
	line-height: 18px;
	color: ${({ active }) => (active ? '#61738d' : '#767d86')};
	margin-top: 4px;
`;
