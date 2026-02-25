import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { BlurView } from '@react-native-community/blur';
import { getAuth } from '@react-native-firebase/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SFSymbol } from 'react-native-sfsymbols';

import { ContentIOS, Button } from './styles';

interface Props {
	currentPath: string;
}

const TabMenu: React.FC<Props> = ({ currentPath }: Props) => {
	const router = useRouter();

	const insets = useSafeAreaInsets();

	const navigateDog = useCallback(() => {
		router.push('/dogs');
	}, [router]);

	const navigateCat = useCallback(() => {
		router.push('/cats');
	}, [router]);

	const navigatePlaces = useCallback(() => {
		router.push('/places');
	}, [router]);

	const navigatePetList = useCallback(() => {
		router.push('/pets');
	}, [router]);

	const navigateAbout = useCallback(() => {
		router.push('/about');
	}, [router]);

	return (
		<ContentIOS
			style={{
				paddingBottom: Math.max(insets.bottom, 25),
			}}
		>
			<BlurView
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					height: 100,
				}}
				blurType="light"
				blurAmount={20}
				reducedTransparencyFallbackColor="#f8cdb9"
			/>

			<Button onPress={navigateDog}>
				<SFSymbol
					name={currentPath === '/dogs' ? 'dog.fill' : 'dog'}
					scale="large"
					color={currentPath === '/dogs' ? '#FFFFFF' : 'black'}
					size={30}
				/>
			</Button>

			<Button onPress={navigateCat}>
				<SFSymbol
					name={currentPath === '/cats' ? 'cat.fill' : 'cat'}
					scale="large"
					color={currentPath === '/cats' ? '#FFFFFF' : 'black'}
					size={30}
				/>
			</Button>

			<Button onPress={navigatePlaces}>
				<SFSymbol
					name={
						currentPath === '/places' ? 'pawprint.fill' : 'pawprint'
					}
					scale="large"
					color={currentPath === '/places' ? '#FFFFFF' : 'black'}
					size={30}
				/>
			</Button>

			{getAuth().currentUser && (
				<Button onPress={navigatePetList}>
					<SFSymbol
						name={
							currentPath.startsWith('/pets')
								? 'heart.text.clipboard.fill'
								: 'heart.text.clipboard'
						}
						scale="large"
						color={
							currentPath.startsWith('/pets') ? '#FFFFFF' : 'black'
						}
						size={30}
					/>
				</Button>
			)}

			<Button onPress={navigateAbout}>
				<SFSymbol
					name={
						currentPath === '/about'
							? 'info.circle.fill'
							: 'info.circle'
					}
					scale="large"
					color={currentPath === '/about' ? '#FFFFFF' : 'black'}
					size={30}
				/>
			</Button>
		</ContentIOS>
	);
};

export default TabMenu;
