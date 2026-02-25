import React, { useCallback, useContext, useState } from 'react';
import { Modal } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { useTranslation } from 'react-i18next';

import { captureException } from '@services/exceptionsHandler';

import CurrentPhotoContext from '@contexts/currentPhoto';

import { saveImageOnGallery } from '@utils/images/save';

import {
	CloseButton,
	CloseButtonText,
	Container,
	ImageContainer,
	Image,
	Button,
	Text,
	LoadingContainer,
	Loading,
} from './styles';

const image: React.FC = () => {
	const photoContext = useContext(CurrentPhotoContext);
	const { t } = useTranslation();

	const [isLoading, setIsLoading] = useState(true);

	const clearPhoto = () => {
		photoContext?.setCurrentPhoto(null);
	};

	const savePhoto = useCallback(async () => {
		if (!photoContext?.currentPhoto) {
			return;
		}

		try {
			const { url } = photoContext?.currentPhoto;

			await saveImageOnGallery(url);

			photoContext.setCurrentPhoto(null);
		} catch (error) {
			captureException({ error, showAlert: true });
		}
	}, [photoContext]);

	const onLoadEnd = () => {
		setIsLoading(false);
	};

	const onLoadStart = () => {
		setIsLoading(true);
	};

	return (
		<Modal
			visible={!!photoContext?.currentPhoto}
			onRequestClose={clearPhoto}
		>
			<Container>
				<CloseButton onPress={clearPhoto}>
					<CloseButtonText>X</CloseButtonText>
				</CloseButton>

				{isLoading && (
					<LoadingContainer>
						<Loading />
					</LoadingContainer>
				)}

				<ImageContainer>
					{!!photoContext?.currentPhoto?.url && (
						<Image
							source={{
								uri: photoContext?.currentPhoto?.url,
							}}
							onLoadStart={onLoadStart}
							onLoadEnd={onLoadEnd}
						/>
					)}

					<Button onPress={savePhoto}>
						<Text>{t('common.save')}</Text>
					</Button>
				</ImageContainer>
			</Container>

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
