import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import {
	getFirestore,
	collection,
	getDocs,
} from '@react-native-firebase/firestore';
import Icon from '@react-native-vector-icons/ionicons';
import { useTranslation } from 'react-i18next';

import { organizeData } from '@utils/adoptionsPlaces/organizeData';
import { convertUFToStateName } from '@utils/UF';

import Header from '@components/header';
import Padding from '@components/padding';
import Loading from '@components/loading';

import {
	Container,
	Title,
	Content,
	PlaceStateContainer,
	PlaceStateText,
	PlaceCityContainer,
	PlaceCityText,
	PlaceButton,
	PlaceName,
} from './styles';

const PlacesList: React.FC = () => {
	const { t } = useTranslation();
	const [isLoading, setIsLoading] = useState(true);

	const [organizedData, setOrganizedData] = useState<GroupedAdoptionPlace>(
		{}
	);

	const loadData = useCallback(async () => {
		try {
			setIsLoading(true);

			const placesCollection = collection(
				getFirestore(),
				'adoptionsPlaces'
			);
			const placesResponse = await getDocs(placesCollection);

			const localPlaces: IAdoptionPlace[] = [];

			placesResponse.forEach(doc => {
				localPlaces.push(doc.data() as IAdoptionPlace);
			});

			const groupedData = organizeData(localPlaces);

			setOrganizedData(groupedData);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, []);

	const sections = useMemo(() => {
		const organized = Object.keys(organizedData).map(uf => {
			const itemsWithCity = organizedData[uf].withCity;
			const itemsWithoutCity = organizedData[uf].withoutCity;
			const allItems = [...itemsWithCity, ...itemsWithoutCity];

			return {
				title: uf,
				data: allItems,
			};
		});

		return organized;
	}, [organizedData]);

	const sortedSections = useMemo(() => {
		const sorted = sections.sort((a, b) => {
			const stateNameA = convertUFToStateName(a.title);
			const stateNameB = convertUFToStateName(b.title);

			return stateNameA.localeCompare(stateNameB);
		});

		return sorted;
	}, [sections]);

	return (
		<Container>
			<Header />

			<Title>{t('places.title')}</Title>
			<Content>
				{isLoading && <Loading />}

				{sortedSections.map(place => (
					<PlaceStateContainer key={place.title}>
						<PlaceStateText>
							{convertUFToStateName(place.title)}
						</PlaceStateText>

						{place.data.map(item => (
							<PlaceCityContainer key={item.name}>
								{item.city && (
									<PlaceCityText>{item.city}</PlaceCityText>
								)}

								{item.instagram && (
									<PlaceButton
										onPress={() =>
											Linking.openURL(item.instagram)
										}
									>
										<Icon name="logo-instagram" size={30} />
										<PlaceName>{item.name}</PlaceName>
									</PlaceButton>
								)}

								{item.facebook && (
									<PlaceButton
										onPress={() =>
											Linking.openURL(item.facebook)
										}
									>
										<Icon name="logo-facebook" size={30} />
										<PlaceName>{item.name}</PlaceName>
									</PlaceButton>
								)}

								{item.whatsapp && (
									<PlaceButton
										onPress={() =>
											Linking.openURL(item.whatsapp)
										}
									>
										<Icon name="logo-whatsapp" size={30} />
										<PlaceName>{item.name}</PlaceName>
									</PlaceButton>
								)}

								{item.url && (
									<PlaceButton
										onPress={() =>
											Linking.openURL(item.url)
										}
									>
										<Icon name="globe-outline" size={30} />
										<PlaceName>{item.name}</PlaceName>
									</PlaceButton>
								)}
							</PlaceCityContainer>
						))}
					</PlaceStateContainer>
				))}
			</Content>

			<Padding size={100} />
		</Container>
	);
};

export default PlacesList;
