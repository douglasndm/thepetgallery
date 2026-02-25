import React, { useRef } from 'react';
import { Platform } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

import {
	Container,
	Content,
	TextContainer,
	AppTitle,
	ButtonIcon,
	Icon,
} from './styles';

const catLogo = Platform.select({
	ios: require('@animations/cat_logo.lottie'),
	android: require('@animations/android/cat_logo.zip'),
});

const Header: React.FC = () => {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const navigation = useNavigation();

	const animRef = useRef<LottieView>(null);

	return (
		<Container style={{ paddingTop: insets.top }}>
			{navigation.canGoBack() && (
				<ButtonIcon onPress={() => router.back()}>
					<Icon name="arrow-back" />
				</ButtonIcon>
			)}

			<Content onPress={() => animRef.current?.play()}>
				<TextContainer>
					<AppTitle>The Pet Gallery</AppTitle>
				</TextContainer>

				<LottieView
					ref={animRef}
					source={catLogo}
					style={{
						width: 100,
						height: 100,
						marginLeft: -25,
					}}
					autoPlay
					loop={false}
				/>
			</Content>
		</Container>
	);
};

export default Header;
