import React, { useState, useCallback, useEffect } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useTranslation } from 'react-i18next';

import { fetchPictures } from '@services/api';

import Header from '@components/header';
import PhotosList from '@components/listanimals';

import {
	Container,
	PageContent,
	PhotosContainer,
	PhotosTitleContainer,
	PhotosTitle,
} from './styles';

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
			const type = 'cat';

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
				<Header />

				<PhotosTitleContainer>
					<PhotosTitle>{t('photos.catsTitle')}</PhotosTitle>
				</PhotosTitleContainer>
			</>
		);
	}, [t]);

	const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const { layoutMeasurement, contentOffset, contentSize } =
			event.nativeEvent;

		const threshold = 0.75; // Percentual da tela antes de carregar mais
		const position = contentOffset.y + layoutMeasurement.height;
		const shouldFetchMore = position >= contentSize.height * threshold;

		if (shouldFetchMore && !loading) {
			setPage(prevPage => prevPage + 1); // Carrega a próxima página
		}
	};

	return (
		<Container>
			<PageContent>
				<PhotosContainer>
					<PhotosList
						ListHeaderComponent={ListHeader}
						onScroll={handleScroll}
						images={images}
					/>
				</PhotosContainer>
			</PageContent>
		</Container>
	);
};

export default ListPics;
