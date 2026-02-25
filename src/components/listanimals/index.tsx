import React, { useMemo } from 'react';
import {
	FlatList,
	NativeScrollEvent,
	NativeSyntheticEvent,
} from 'react-native';
import { usePathname } from 'expo-router';

import Modal from '@components/modal/image';
import Padding from '@components/padding';

import Image from './image';

interface Props {
	images: APIItem[];
	ListHeaderComponent?:
		| React.ReactElement<any, string | React.JSXElementConstructor<any>>
		| React.ComponentType<any>
		| null
		| undefined;
	onScroll?:
		| ((event: NativeSyntheticEvent<NativeScrollEvent>) => void)
		| undefined;
}

const ListAnimals: React.FC<Props> = ({
	images,
	ListHeaderComponent,
	onScroll,
}: Props) => {
	const pathname = usePathname();

	const imageType = useMemo(() => {
		if (pathname === '/dogs') {
			return 'Dog';
		}

		if (pathname === '/cats') {
			return 'Cat';
		}

		return undefined;
	}, [pathname]);

	return (
		<>
			<Modal />
			<FlatList
				data={images}
				ListHeaderComponent={ListHeaderComponent}
				numColumns={1}
				renderItem={({ item, index }) => (
					<Image item={item} type={imageType} index={index} />
				)}
				onScroll={onScroll}
				ListFooterComponent={<Padding />}
			/>
		</>
	);
};

export default ListAnimals;
