import React, { useCallback, useContext, useState } from 'react';
import { Platform, NativeSyntheticEvent } from 'react-native';
import ContextMenu, {
	ContextMenuOnPressNativeEvent,
} from 'react-native-context-menu-view';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';

import { captureException } from '@services/exceptionsHandler';

import { saveImageOnGallery } from '@utils/images/save';

import CurrentPhotoContext from '@contexts/currentPhoto';

import { Container, Photo } from '../styles';
import { PhotoContainer, lottieStyle } from './styles';

const dogLoading = Platform.select({
	ios: require('@animations/dog_loading.lottie'),
	android: require('@animations/android/dog_loading.zip'),
});

const catLoading = Platform.select({
	ios: require('@animations/cat_loading.lottie'),
	android: require('@animations/android/cat_loading.zip'),
});

interface Props {
	item: APIItem;
	type?: 'Cat' | 'Dog';
	index: number;
}

const Image: React.FC<Props> = ({ item, type = 'Dog', index }: Props) => {
	const { t } = useTranslation();
	const [isLoading, setIsLoading] = useState(true);

	const photoContext = useContext(CurrentPhotoContext);

	const Loading = useCallback(() => {
		return (
			<LottieView
				source={type === 'Cat' ? catLoading : dogLoading}
				style={lottieStyle.lottie}
				autoPlay
				loop
			/>
		);
	}, [type]);

	const onLoadEnd = () => {
		setIsLoading(false);
	};

	const onLoadStart = () => {
		setIsLoading(true);
	};

	const MemorizedImage = useCallback(
		() => (
			<PhotoContainer onPress={() => photoContext?.setCurrentPhoto(item)}>
				<Photo
					source={{ uri: item.url }}
					onLoadStart={onLoadStart}
					onLoadEnd={onLoadEnd}
				/>
			</PhotoContainer>
		),
		[item, photoContext]
	);

	const handleContextPress = useCallback(
		async (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>) => {
			if (e.nativeEvent.index === 0) {
				try {
					await saveImageOnGallery(item.url);
				} catch (error) {
					captureException({
						error,
						showAlert: true,
					});
				}
			}
		},
		[item]
	);

	return (
		<Container style={{ marginRight: index % 2 === 0 ? 10 : 0 }}>
			<ContextMenu
				actions={[{ title: t('images.saveToGallery') }]}
				onPress={handleContextPress}
			>
				<MemorizedImage />
			</ContextMenu>
			{isLoading && <Loading />}
		</Container>
	);
};

export default Image;
