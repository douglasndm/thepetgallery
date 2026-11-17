import styled from 'styled-components/native';

export const Container = styled.ScrollView.attrs(() => ({
	contentInsetAdjustmentBehavior: 'never',
	alwaysBounceVertical: true,
	contentContainerStyle: {
		flexGrow: 1,
	},
}))`
	background-color: #eef0f3;
	flex: 1;
`;

export const Title = styled.Text`
	margin: 0 20px 16px;
	font-size: 28px;
	line-height: 34px;
	font-weight: 800;
	color: #151515;
`;

export const Content = styled.View``;

export const PlaceStateContainer = styled.View`
	background-color: #ffffff;
	margin: 0 20px 14px;
	padding: 18px;
	border-radius: 22px;
`;

export const PlaceStateText = styled.Text`
	font-weight: 800;
	font-size: 18px;
	color: #151515;
`;

export const PlaceCityContainer = styled.View``;

export const PlaceCityText = styled.Text`
	color: #616772;
	margin: 4px 0 0;
`;

export const PlaceButton = styled.TouchableOpacity`
	margin-top: 10px;
	padding: 15px;
	border-radius: 12px;

	flex-direction: row;
	align-items: center;

	background-color: #f6e3da;
`;

export const PlaceName = styled.Text`
	color: #363535;
	margin-left: 10px;
	font-weight: bold;
`;
