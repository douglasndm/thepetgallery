import React, { useRef } from 'react';
import { Platform } from 'react-native';
import { useNavigation, useRootNavigationState, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

import {
	Container,
	Bar,
	Side,
	BackButton,
	BackIcon,
	Content,
	AppTitle,
} from './styles';

const catLogo = Platform.select({
	ios: require('@animations/cat_logo.lottie'),
	android: require('@animations/android/cat_logo.zip'),
});

interface Props {
	title?: string;
}

const Header: React.FC<Props> = ({ title = 'The Pet Gallery' }: Props) => {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const navigation = useNavigation();
	const rootNavigationState = useRootNavigationState();

	const animRef = useRef<LottieView>(null);
	const canGoBack =
		navigation.canGoBack() ||
		(rootNavigationState?.index ?? 0) > 0 ||
		(rootNavigationState?.routes?.length ?? 0) > 1;

	return (
		<Container style={{ paddingTop: insets.top }}>
			<Bar>
				<Side>
					{canGoBack && (
						<BackButton
							onPress={() => router.back()}
							hitSlop={10}
							accessibilityRole="button"
						>
							<BackIcon name="chevron-back" />
						</BackButton>
					)}
				</Side>

				<Content onPress={() => animRef.current?.play()}>
					<AppTitle numberOfLines={1}>{title}</AppTitle>

					<LottieView
						ref={animRef}
						source={catLogo}
						style={{ width: 56, height: 56, marginLeft: -6 }}
						autoPlay
						loop={false}
					/>
				</Content>

				<Side />
			</Bar>
		</Container>
	);
};

export default Header;
