import styled from 'styled-components/native';

export const Container = styled.ScrollView.attrs(() => ({
	contentInsetAdjustmentBehavior: 'never',
	alwaysBounceVertical: true,
	contentContainerStyle: {
		flexGrow: 1,
	},
}))`
	background-color: #e8e8ea;
`;

export const Content = styled.View`
	padding: 20px;
`;

export const Title = styled.Text`
	font-size: 28px;
	font-weight: bold;
	margin-bottom: 8px;
	color: #000;
`;

export const Description = styled.Text`
	font-size: 16px;
	margin-bottom: 20px;
	color: #333;
`;
