import { StyleSheet, Dimensions } from 'react-native';

const cardWidth = Dimensions.get('window').width - 40;

export default StyleSheet.create({
	container: {
		width: cardWidth,
		alignSelf: 'center',
		marginBottom: 20,
		padding: 14,
		borderRadius: 22,
		backgroundColor: '#ffffff',
		overflow: 'hidden',
	},
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	title: {
		flex: 1,
		fontSize: 17,
		fontWeight: '800',
		color: '#151515',
		marginLeft: 10,
	},
	media: {
		width: '100%',
		height: cardWidth * 0.6,
		borderRadius: 14,
		overflow: 'hidden',
	},
	sponsored: {
		alignSelf: 'flex-start',
		color: '#8a5a47',
		fontSize: 11,
		fontWeight: '700',
		letterSpacing: 0.4,
		backgroundColor: '#f6e3da',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
		marginTop: 12,
	},
});
