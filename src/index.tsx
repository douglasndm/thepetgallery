import React, { useCallback, useState, useRef } from 'react';
import {
	NavigationContainer,
	NavigationContainerRef,
} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import { getAnalytics } from '@react-native-firebase/analytics';
import { useNetInfo } from '@react-native-community/netinfo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import FlashMessage from 'react-native-flash-message';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import EnvConfig from '@services/env';
import '@services/firebase/appchecker';

import '@utils/permissions/notifications';

import CurrentPhotoContext from '@contexts/currentPhoto';

import TabMenu from '@components/tabmenu';
import NoInternet from '@components/NoInternet';
import Notifications from './components/notifications';

import Routes from './routes';

GoogleSignin.configure({
	webClientId: 'autoDetect',
});

const navigationIntegration = Sentry.reactNavigationIntegration({
	enableTimeToInitialDisplay: true,
});

const App: React.FC = () => {
	const routeNameRef = useRef<string | undefined>(undefined);
	const navigationRef = useRef<NavigationContainerRef<AppRoutes>>(null);

	const [currentRoute, setCurrentRoute] = useState<string | undefined>(
		undefined
	);
	const [currentPhoto, setCurrentPhoto] = useState<APIItem | null>(null);

	const { isInternetReachable } = useNetInfo();

	const onRouteChange = useCallback(async () => {
		if (!navigationRef || !navigationRef.current) return;

		const previousRouteName = routeNameRef.current;
		const currentRouteName = navigationRef.current.getCurrentRoute()?.name;

		setCurrentRoute(currentRouteName);

		if (__DEV__) return;
		if (previousRouteName !== currentRouteName) {
			await getAnalytics().logScreenView({
				screen_name: currentRouteName,
				screen_class: currentRouteName,
			});
		}

		if (currentRouteName) {
			routeNameRef.current = currentRouteName;
		}
	}, []);

	return (
		<NavigationContainer
			ref={navigationRef}
			onReady={() => {
				navigationIntegration.registerNavigationContainer(
					navigationRef
				);
			}}
			onStateChange={onRouteChange}
		>
			<SafeAreaProvider>
				<PaperProvider>
					<CurrentPhotoContext.Provider
						value={{ currentPhoto, setCurrentPhoto }}
					>
						{!isInternetReachable && <NoInternet />}
						<Notifications />
						<Routes />
						<TabMenu currentRoute={currentRoute} />

						<FlashMessage
							position="top"
							statusBarHeight={40}
							duration={6000}
						/>
					</CurrentPhotoContext.Provider>
				</PaperProvider>
			</SafeAreaProvider>
		</NavigationContainer>
	);
};

export default App;
