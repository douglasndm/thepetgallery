import React, { useEffect, useRef } from 'react';
import { Stack, useNavigationContainerRef, usePathname } from 'expo-router';
import { Observe } from 'expo-observe';
import * as Sentry from '@sentry/react-native';
import { getAnalytics } from '@react-native-firebase/analytics';
import { useNetInfo } from '@react-native-community/netinfo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import FlashMessage from 'react-native-flash-message';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const previousHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
	if (isFatal) {
		Observe.logEvent('xprem_js_crash', {
			severity: 'fatal',
			attributes: { message: String(error?.message ?? error) },
		});
	}
	previousHandler?.(error, isFatal);
});

import '@services/sentry';
import { setupInstallationId } from '@services/sentry';
import '@utils/permissions/notifications';
import '@app/i18n';

import CurrentPhotoContext from '@contexts/currentPhoto';

import NoInternet from '@components/NoInternet';
import Notifications from '@components/notifications';

GoogleSignin.configure({
	webClientId: 'autoDetect',
});

const navigationIntegration = Sentry.reactNavigationIntegration({
	enableTimeToInitialDisplay: true,
});

const RootLayout: React.FC = () => {
	const navigationRef = useNavigationContainerRef();
	const pathname = usePathname();
	const previousPathRef = useRef<string | undefined>(undefined);

	const [currentPhoto, setCurrentPhoto] = React.useState<APIItem | null>(
		null
	);

	const { isInternetReachable } = useNetInfo();

	useEffect(() => {
		Observe.logEvent('app_started');
	}, []);

	useEffect(() => {
		setupInstallationId();
	}, []);

	useEffect(() => {
		if (navigationRef.isReady()) {
			navigationIntegration.registerNavigationContainer(navigationRef);
		}
	}, [navigationRef, pathname]);

	useEffect(() => {
		if (__DEV__) {
			previousPathRef.current = pathname;
			return;
		}

		if (previousPathRef.current !== pathname) {
			getAnalytics().logScreenView({
				screen_name: pathname,
				screen_class: pathname,
			});
		}

		previousPathRef.current = pathname;
	}, [pathname]);

	return (
		<SafeAreaProvider>
			<PaperProvider>
				<CurrentPhotoContext.Provider
					value={{ currentPhoto, setCurrentPhoto }}
				>
					{!isInternetReachable && <NoInternet />}
					<Notifications />
					<Stack screenOptions={{ headerShown: false }} />

					<FlashMessage
						position="top"
						statusBarHeight={40}
						duration={6000}
					/>
				</CurrentPhotoContext.Provider>
			</PaperProvider>
		</SafeAreaProvider>
	);
};

export default Sentry.wrap(RootLayout);
