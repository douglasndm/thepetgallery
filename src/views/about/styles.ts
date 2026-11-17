import styled from 'styled-components/native';

export const Container = styled.ScrollView.attrs(() => ({
	alwaysBounceVertical: true,
	contentContainerStyle: {
		flexGrow: 1,
	},
}))`
	background-color: #eef0f3;
`;

export const Content = styled.View`
	background-color: #ffffff;

	align-self: center;
	width: 90%;
	border-radius: 22px;

	padding: 20px;
`;

export const AppName = styled.Text`
	font-size: 22px;
	font-weight: bold;
	margin-bottom: 5px;
`;
export const Info = styled.Text`
	font-size: 16px;
`;

export const InstallationIdCard = styled.TouchableOpacity`
	margin-top: 18px;
	/* padding: 14px 16px; */
	border-radius: 16px;
	/* background-color: rgba(255, 255, 255, 0.48); */
	/* border: 1px solid rgba(0, 0, 0, 0.08); */
`;

export const InstallationIdLabel = styled.Text`
	font-size: 12px;
	font-weight: 700;
	letter-spacing: 0.5px;
	text-transform: uppercase;
	color: rgba(0, 0, 0, 0.58);
	margin-bottom: 6px;
`;

export const InstallationIdValue = styled.Text`
	font-size: 14px;
	line-height: 20px;
	color: #111111;
`;

export const Title = styled.Text`
	margin: 0 20px 16px;
	font-size: 28px;
	line-height: 34px;
	font-weight: 800;
	color: #151515;
`;

export const AttibuitionContainer = styled.View`
	margin-top: 15px;
`;

export const Attibution = styled.Text``;

export const AttibutionLink = styled.Text`
	color: #000;
	text-decoration-line: underline;
`;
