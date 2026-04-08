import { StyleSheet, Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;

export default StyleSheet.create({
	container: {
		width: '100%',
		height: 500,
		marginBottom: 10,
		backgroundColor: '#f8cdb9',
		overflow: 'hidden',
	},
});
