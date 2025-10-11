import styled from 'styled-components/native';

export const Container = styled.ScrollView.attrs(() => ({
	alwaysBounceVertical: true,
	contentContainerStyle: {
		flexGrow: 1,
	},
}))`
	background-color: #e8e8ea;
	flex: 1;
`;

export const Title = styled.Text`
	margin: 0px 25px 5px;
	font-size: 18px;
`;

export const Content = styled.View``;

export const PlaceStateContainer = styled.View`
	background-color: #f8cdb9;
	margin: 5px 20px;
	padding: 20px;
	border-radius: 20px;
`;

export const PlaceStateText = styled.Text`
	font-weight: bold;
	font-size: 18px;
	color: #fff;
`;

export const PlaceCityContainer = styled.View``;

export const PlaceCityText = styled.Text`
	color: rgb(80, 79, 79);
	margin: 5px 0 0;
`;

export const PlaceButton = styled.TouchableOpacity`
	margin-top: 10px;
	padding: 15px;
	border-radius: 12px;

	flex-direction: row;
	align-items: center;

	background-color: #fff;
	opacity: 0.85;
`;

export const PlaceName = styled.Text`
	color: #363535;
	margin-left: 10px;
	font-weight: bold;
`;
