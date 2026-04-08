import styled from 'styled-components/native';
import { Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export const Container = styled.ScrollView.attrs(() => ({
	contentInsetAdjustmentBehavior: 'automatic',
	alwaysBounceVertical: true,
	contentContainerStyle: {
		flexGrow: 1,
		paddingBottom: 32,
	},
}))`
	background-color: #eef0f3;
`;

export const Hero = styled.View`
	padding: 0 20px 18px;
`;

export const HeroTag = styled.Text`
	align-self: flex-start;
	background-color: #e7f0ea;
	color: #4f7b60;
	font-size: 12px;
	font-weight: 700;
	letter-spacing: 0.6px;
	text-transform: uppercase;
	padding: 8px 10px;
	border-radius: 999px;
	margin-bottom: 12px;
`;

export const HeroTitle = styled.Text`
	font-size: 28px;
	line-height: 34px;
	font-weight: 800;
	color: #151515;
	margin-bottom: 8px;
`;

export const HeroDescription = styled.Text`
	font-size: 15px;
	line-height: 22px;
	color: #5a5f68;
`;

export const ProfileCard = styled(Surface).attrs(() => ({
	elevation: 2,
}))`
	margin: 0 20px 18px;
	border-radius: 28px;
	padding: 24px 20px;
	background-color: #ffffff;
	align-items: center;
`;

export const Avatar = styled.View`
	width: 78px;
	height: 78px;
	border-radius: 999px;
	background-color: #eef3f0;
	align-items: center;
	justify-content: center;
	margin-bottom: 16px;
`;

export const AvatarIcon = styled(Ionicons).attrs(() => ({
	name: 'person-outline',
	size: 34,
	color: '#5f7c6d',
}))``;

export const Name = styled.Text`
	font-size: 24px;
	font-weight: 800;
	color: #111111;
	text-align: center;
	margin-bottom: 6px;
`;

export const Email = styled.Text`
	font-size: 15px;
	line-height: 22px;
	color: rgb(85, 85, 85);
	text-align: center;
`;

export const SectionCard = styled(Surface).attrs(() => ({
	elevation: 1,
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

export const ActionButton = styled.TouchableOpacity<{ danger?: boolean }>`
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

export const ActionIconWrap = styled.View<{ danger?: boolean }>`
	width: 40px;
	height: 40px;
	border-radius: 14px;
	background-color: ${({ danger }) => (danger ? '#faece9' : '#f3f5f8')};
	align-items: center;
	justify-content: center;
	margin-right: 12px;
`;

export const ActionIcon = styled(Ionicons).attrs<{ danger?: boolean }>(
	({ danger }) => ({
		size: 20,
		color: danger ? '#b05d49' : '#4c5260',
	})
)``;

export const ActionTexts = styled.View`
	flex: 1;
`;

export const ActionTitle = styled.Text<{ danger?: boolean }>`
	font-size: 15px;
	font-weight: 700;
	color: ${({ danger }) => (danger ? '#8e4c3b' : '#16181c')};
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

export const LoadingOverlay = styled.View`
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	background-color: rgba(238, 240, 243, 0.76);
	align-items: center;
	justify-content: center;
	padding: 24px;
	z-index: 5;
`;
