import { StyleSheet, Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;

export default StyleSheet.create({
	container: {
		width: '100%',
		flex: 1,
		marginBottom: 10,
		backgroundColor: '#f8cdb9',
		overflow: 'hidden',
	},
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 10,
		marginBlock: 10,
		marginLeft: 7,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#242424',
		marginLeft: 7,
	},
	sponsored: {
		alignSelf: 'flex-start',
		color: '#FFFFFF',
		fontSize: 11,
		fontWeight: '700',
		letterSpacing: 0.8,
		textTransform: 'uppercase',
		backgroundColor: 'rgba(0, 0, 0, 0.28)',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
		marginBottom: 10,
		marginTop: 10,
		marginLeft: 7,
	},
});
