// import { StyleSheet, Dimensions } from 'react-native';

// const windowWidth = Dimensions.get('window').width;

// export default StyleSheet.create({
// 	container: {
// 		width: '100%',
// 		height: 500,
// 		marginBottom: 10,
// 		backgroundColor: '#f8cdb9',
// 		overflow: 'hidden',
// 	},
// 	content: {
// 		flex: 1,
// 		justifyContent: 'flex-end',
// 	},
// 	media: {
// 		...StyleSheet.absoluteFill,
// 		width: windowWidth,
// 		height: 500,
// 	},
// 	textContainer: {
// 		paddingHorizontal: 18,
// 		paddingTop: 14,
// 		paddingBottom: 22,
// 		backgroundColor: 'rgba(0, 0, 0, 0.42)',
// 	},
// 	headline: {
// 		fontSize: 24,
// 		fontWeight: 'bold',
// 		color: '#FFFFFF',
// 	},
// 	body: {
// 		color: '#FFFFFF',
// 		fontSize: 15,
// 		lineHeight: 21,
// 		fontFamily: 'Open Sans',
// 		marginTop: 8,
// 	},
// 	store: {
// 		color: 'rgba(255, 255, 255, 0.92)',
// 		fontSize: 13,
// 		fontFamily: 'Open Sans',
// 		marginTop: 6,
// 	},
// 	sponsored: {
// 		alignSelf: 'flex-start',
// 		color: '#FFFFFF',
// 		fontSize: 11,
// 		fontWeight: '700',
// 		letterSpacing: 0.8,
// 		textTransform: 'uppercase',
// 		backgroundColor: 'rgba(0, 0, 0, 0.28)',
// 		paddingHorizontal: 8,
// 		paddingVertical: 4,
// 		borderRadius: 999,
// 		marginBottom: 10,
// 	},
// });

import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
	container: {
		width: Dimensions.get('screen').width - 20,
		margin: 10,
		padding: 10,
		borderRadius: 12,
		backgroundColor: '#CC4B4B',
		marginBottom: 3,
		marginTop: 3,
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	media: {
		width: 120,
		height: 120,
		borderRadius: 60,
	},
	textContainer: {
		flex: 1,
		marginLeft: 15,
	},
	headline: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#fff',
		textTransform: 'uppercase',
	},
	body: {
		color: '#fff',
		fontSize: 15,
		fontFamily: 'Open Sans',
	},
	store: {
		color: '#fff',
		fontSize: 14,
		fontFamily: 'Open Sans',
	},
	sponsored: {
		color: '#fff',
		fontSize: 13,
	},
});
