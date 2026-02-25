import React from 'react';
import { Platform } from 'react-native';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';

import { Container, Content, Text } from './styles';

const noConnection = Platform.select({
	ios: require('@animations/no_connection.lottie'),
	android: require('@animations/android/no_connection.zip'),
});

const NoInternet: React.FC = () => {
	const { t } = useTranslation();

	return (
		<Container>
			<Content>
				<LottieView
					source={noConnection}
					style={{
						width: 250,
						height: 250,
					}}
					autoPlay
					loop
				/>
				<Text>{t('offline.noInternet')}</Text>
			</Content>
		</Container>
	);
};

export default NoInternet;
