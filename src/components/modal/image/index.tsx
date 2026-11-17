import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	Animated,
	Dimensions,
	Modal,
	PanResponder,
	StatusBar,
} from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { useTranslation } from 'react-i18next';

import { captureException } from '@services/exceptionsHandler';

import CurrentPhotoContext from '@contexts/currentPhoto';

import { saveImageOnGallery } from '@utils/images/save';

import {
	CloseButton,
	CloseIcon,
	ImageContainer,
	ImageView,
	Button,
	Text,
	LoadingContainer,
	Loading,
	Hint,
} from './styles';

const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 0.8;

const image: React.FC = () => {
	const photoContext = useContext(CurrentPhotoContext);
	const { t } = useTranslation();

	const [isLoading, setIsLoading] = useState(true);

	const translateY = useRef(new Animated.Value(0)).current;
	const currentPhoto = photoContext?.currentPhoto;
	const isVisible = !!currentPhoto;

	useEffect(() => {
		if (isVisible) {
			translateY.setValue(0);
			setIsLoading(true);
		}
	}, [isVisible, translateY]);

	const clearPhoto = useCallback(() => {
		photoContext?.setCurrentPhoto(null);
	}, [photoContext]);

	const dismissWithAnimation = useCallback(() => {
		Animated.timing(translateY, {
			toValue: Dimensions.get('window').height,
			duration: 220,
			useNativeDriver: true,
		}).start(clearPhoto);
	}, [translateY, clearPhoto]);

	const panResponder = useMemo(
		() =>
			PanResponder.create({
				onMoveShouldSetPanResponder: (_, { dx, dy }) =>
					dy > 8 && Math.abs(dy) > Math.abs(dx) * 1.5,
				onPanResponderMove: (_, { dy }) => {
					translateY.setValue(Math.max(0, dy));
				},
				onPanResponderRelease: (_, { dy, vy }) => {
					if (dy > CLOSE_DISTANCE || vy > CLOSE_VELOCITY) {
						dismissWithAnimation();
						return;
					}

					Animated.spring(translateY, {
						toValue: 0,
						useNativeDriver: true,
						bounciness: 6,
					}).start();
				},
				onPanResponderTerminate: () => {
					Animated.spring(translateY, {
						toValue: 0,
						useNativeDriver: true,
					}).start();
				},
			}),
		[translateY, dismissWithAnimation]
	);

	const backgroundOpacity = translateY.interpolate({
		inputRange: [0, 300],
		outputRange: [1, 0.2],
		extrapolate: 'clamp',
	});

	const savePhoto = useCallback(async () => {
		if (!currentPhoto) {
			return;
		}

		try {
			await saveImageOnGallery(currentPhoto.url);

			clearPhoto();
		} catch (error) {
			captureException({ error, showAlert: true });
		}
	}, [currentPhoto, clearPhoto]);

	return (
		<Modal
			visible={isVisible}
			onRequestClose={clearPhoto}
			animationType="fade"
			transparent
			statusBarTranslucent
		>
			<StatusBar barStyle="light-content" />

			<Animated.View
				style={{
					flex: 1,
					backgroundColor: '#000',
					opacity: backgroundOpacity,
					position: 'absolute',
					top: 0,
					bottom: 0,
					left: 0,
					right: 0,
				}}
			/>

			<Animated.View
				style={{ flex: 1, transform: [{ translateY }] }}
				{...panResponder.panHandlers}
			>
				<CloseButton onPress={clearPhoto} hitSlop={10}>
					<CloseIcon name="close" />
				</CloseButton>

				{isLoading && (
					<LoadingContainer pointerEvents="none">
						<Loading color="#fff" />
					</LoadingContainer>
				)}

				<ImageContainer>
					{!!currentPhoto?.url && (
						<ImageView
							source={{ uri: currentPhoto.url }}
							onLoadStart={() => setIsLoading(true)}
							onLoadEnd={() => setIsLoading(false)}
						/>
					)}

					<Button onPress={savePhoto}>
						<Text>{t('common.save')}</Text>
					</Button>

					<Hint />
				</ImageContainer>
			</Animated.View>

			<FlashMessage
				duration={7000}
				statusBarHeight={50}
				style={{ zIndex: 100 }}
				floating
			/>
		</Modal>
	);
};

export default image;
