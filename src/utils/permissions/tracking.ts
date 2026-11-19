import { AppState, Platform } from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';
import {
	getTrackingPermissionsAsync,
	requestTrackingPermissionsAsync,
	PermissionStatus,
} from 'expo-tracking-transparency';

import { captureException } from '@services/exceptionsHandler';

let trackingReady: Promise<void> | null = null;

function waitForActiveApp(): Promise<void> {
	if (AppState.currentState === 'active') {
		return new Promise(resolve => setTimeout(resolve, 500));
	}

	return new Promise(resolve => {
		const subscription = AppState.addEventListener('change', state => {
			if (state === 'active') {
				subscription.remove();
				setTimeout(resolve, 500);
			}
		});
	});
}

async function run(): Promise<void> {
	try {
		if (Platform.OS === 'ios') {
			// The ATT prompt is only shown while the app is active.
			await waitForActiveApp();

			const { status } = await getTrackingPermissionsAsync();

			if (status === PermissionStatus.UNDETERMINED) {
				await requestTrackingPermissionsAsync();
			}
		}

		// The ads SDK is only started after the ATT answer.
		await mobileAds().initialize();
	} catch (error) {
		captureException({ error });
	}
}

/**
 * Asks for App Tracking Transparency (iOS) and then initializes the ads SDK.
 * Safe to call many times; the flow runs once.
 */
function setupTrackingAndAds(): Promise<void> {
	if (!trackingReady) {
		trackingReady = run();
	}

	return trackingReady;
}

export { setupTrackingAndAds };
