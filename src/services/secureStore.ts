import * as ExpoSecureStore from 'expo-secure-store';

const backgroundSafeOptions: ExpoSecureStore.SecureStoreOptions = {
	keychainAccessible: ExpoSecureStore.AFTER_FIRST_UNLOCK,
};

function getItem(key: string): string | null {
	return ExpoSecureStore.getItem(key, backgroundSafeOptions);
}

function setItem(key: string, value: string): void {
	return ExpoSecureStore.setItem(key, value, backgroundSafeOptions);
}

async function getItemAsync(key: string): Promise<string | null> {
	return ExpoSecureStore.getItemAsync(key, backgroundSafeOptions);
}

async function setItemAsync(key: string, value: string): Promise<void> {
	return ExpoSecureStore.setItemAsync(key, value, backgroundSafeOptions);
}

async function deleteItemAsync(key: string): Promise<void> {
	return ExpoSecureStore.deleteItemAsync(key, backgroundSafeOptions);
}

export {
	getItem,
	setItem,
	getItemAsync,
	setItemAsync,
	deleteItemAsync,
	backgroundSafeOptions,
};
