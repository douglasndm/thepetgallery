import React, { useState, useCallback, useEffect } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useTranslation } from 'react-i18next';

import { fetchPictures } from '@services/api';

import Screen from '@components/screen';
import PhotosList from '@components/listanimals';

import { PhotosTitleContainer, PhotosTitle } from './styles';

const ListPics: React.FC = () => {
	const { t } = useTranslation();
	const [images, setImages] = useState<APIItem[]>([]);
	const [page, setPage] = useState(0);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);

	const loadData = useCallback(async () => {
		if (!hasMore) {
			return;
		}

		setLoading(true);
		try {
			const type = 'dog';

			const response = await fetchPictures({ type, page });

			if (response.length > 0) {
				setImages(prevData => [...prevData, ...response]);
			} else {
				setHasMore(false);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, [hasMore, page]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const ListHeader = useCallback(() => {
		return (
			<>
				<PhotosTitleContainer>
					<PhotosTitle>{t('photos.dogsTitle')}</PhotosTitle>
				</PhotosTitleContainer>
			</>
		);
	}, [t]);

	const handleScroll = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			const { layoutMeasurement, contentOffset, contentSize } =
				event.nativeEvent;

			const threshold = 0.75; // Percentual da tela antes de carregar mais
			const position = contentOffset.y + layoutMeasurement.height;
			const shouldFetchMore = position >= contentSize.height * threshold;

			if (shouldFetchMore && !loading) {
				setPage(prevPage => prevPage + 1); // Carrega a próxima página
			}
		},
		[loading]
	);

	return (
		<Screen>
			<PhotosList
				ListHeaderComponent={ListHeader}
				onScroll={handleScroll}
				images={images}
			/>
		</Screen>
	);
};

export default ListPics;
