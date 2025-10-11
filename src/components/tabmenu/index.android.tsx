import React, { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAuth } from '@react-native-firebase/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Container, Content, Button, Icon, MaterialIcons } from './styles';

interface Props {
	currentRoute: string | undefined;
}

const TabMenu: React.FC<Props> = (props: Props) => {
	const { navigate } = useNavigation<NativeStackNavigationProp<AppRoutes>>();

	const insets = useSafeAreaInsets();

	const navigateDog = useCallback(() => {
		navigate('DogsView', {});
	}, [navigate]);

	const navigateCat = useCallback(() => {
		navigate('CatsView', {});
	}, [navigate]);

	const navigatePlaces = useCallback(() => {
		navigate('PlacesList', {});
	}, [navigate]);

	const navigatePetList = useCallback(() => {
		navigate('PetList', {});
	}, [navigate]);

	const navigateAbout = useCallback(() => {
		navigate('About', {});
	}, [navigate]);

	return (
		<Container>
			<Content style={{ paddingBottom: Math.max(insets.bottom, 25) }}>
				<Button onPress={navigateDog}>
					<Icon
						source={require('@assets/images/doghead.png')}
						isSelected={props.currentRoute === 'DogsView'}
					/>
				</Button>
				<Button onPress={navigateCat}>
					<Icon
						source={require('@assets/images/cathead.png')}
						isSelected={props.currentRoute === 'CatsView'}
					/>
				</Button>

				<Button onPress={navigatePlaces}>
					<Icon
						source={require('@assets/images/petshospital.png')}
						isSelected={props.currentRoute === 'PlacesList'}
					/>
				</Button>

				{getAuth().currentUser && (
					<Button onPress={navigatePetList}>
						<MaterialIcons
							name="paw"
							isSelected={props.currentRoute === 'PetList'}
						/>
					</Button>
				)}

				<Button onPress={navigateAbout}>
					<Icon
						source={require('@assets/images/navigationmenu.png')}
						isSelected={props.currentRoute === 'About'}
					/>
				</Button>
			</Content>
		</Container>
	);
};

export default TabMenu;
