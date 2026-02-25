import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { getAuth } from '@react-native-firebase/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Container, Content, Button, Icon, MaterialIcons } from './styles';

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
		<Container>
			<Content style={{ paddingBottom: Math.max(insets.bottom, 25) }}>
				<Button onPress={navigateDog}>
					<Icon
						source={require('@assets/images/doghead.png')}
						isSelected={currentPath === '/dogs'}
					/>
				</Button>
				<Button onPress={navigateCat}>
					<Icon
						source={require('@assets/images/cathead.png')}
						isSelected={currentPath === '/cats'}
					/>
				</Button>

				<Button onPress={navigatePlaces}>
					<Icon
						source={require('@assets/images/petshospital.png')}
						isSelected={currentPath === '/places'}
					/>
				</Button>

				{getAuth().currentUser && (
					<Button onPress={navigatePetList}>
						<MaterialIcons
							name="paw"
							isSelected={currentPath.startsWith('/pets')}
						/>
					</Button>
				)}

				<Button onPress={navigateAbout}>
					<Icon
						source={require('@assets/images/navigationmenu.png')}
						isSelected={currentPath === '/about'}
					/>
				</Button>
			</Content>
		</Container>
	);
};

export default TabMenu;
