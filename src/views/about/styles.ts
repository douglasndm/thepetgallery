import styled from 'styled-components/native';

export const Container = styled.ScrollView.attrs(() => ({
	alwaysBounceVertical: true,
	contentContainerStyle: {
		flexGrow: 1,
	},
}))`
	background-color: #e8e8ea;
`;

export const Content = styled.View`
	background-color: #f8cdb9;

	align-self: center;
	width: 90%;
	border-radius: 12px;

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

export const Title = styled.Text`
	margin-left: 25px;
	margin-bottom: 10px;
	font-size: 17px;
`;

export const AttibuitionContainer = styled.View`
	margin-top: 15px;
`;

export const Attibution = styled.Text``;

export const AttibutionLink = styled.Text`
	color: #000;
	text-decoration-line: underline;
`;
