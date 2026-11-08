import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as Updates from 'expo-updates';

/** Shorter absences keep the user where they were instead of reloading. */
const MIN_BACKGROUND_TO_APPLY_MS = 10 * 60_000;

const UPDATE_CHECK_INTERVAL_MS = 30 * 60_000;

/**
 * Downloads OTA updates when the app returns to the foreground and applies a
 * downloaded one when the user comes back after a long absence. Otherwise the
 * update waits for the next cold start, which is the default behavior.
 */
function useAutoApplyUpdates(): void {
	const { isUpdatePending } = Updates.useUpdates();
	const isUpdatePendingRef = useRef(isUpdatePending);

	useEffect(() => {
		isUpdatePendingRef.current = isUpdatePending;
	}, [isUpdatePending]);

	useEffect(() => {
		// After an emergency launch the last update failed: don't reload into another.
		if (__DEV__ || !Updates.isEnabled || Updates.isEmergencyLaunch) return;

		let backgroundedAt: number | null = null;
		// expo-updates has just checked during launch.
		let lastCheckAt = Date.now();

		const applyUpdate = async () => {
			try {
				await Updates.reloadAsync();
			} catch (error) {
				console.warn('Failed to apply OTA update:', error);
			}
		};

		const downloadUpdate = async () => {
			try {
				const update = await Updates.checkForUpdateAsync();
				if (update.isAvailable) {
					await Updates.fetchUpdateAsync();
				}
			} catch (error) {
				console.warn('Failed to download OTA update:', error);
			}
		};

		const subscription = AppState.addEventListener('change', nextState => {
			if (nextState === 'background') {
				backgroundedAt ??= Date.now();
				return;
			}

			if (nextState !== 'active' || backgroundedAt === null) return;

			const now = Date.now();
			const backgroundTime = now - backgroundedAt;
			backgroundedAt = null;

			if (isUpdatePendingRef.current) {
				if (backgroundTime >= MIN_BACKGROUND_TO_APPLY_MS) {
					void applyUpdate();
				}
				return;
			}

			if (now - lastCheckAt >= UPDATE_CHECK_INTERVAL_MS) {
				lastCheckAt = now;
				void downloadUpdate();
			}
		});

		return () => subscription.remove();
	}, []);
}

export { useAutoApplyUpdates };
