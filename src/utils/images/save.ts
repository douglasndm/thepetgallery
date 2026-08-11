import { Directory, File, Paths } from 'expo-file-system';
import { Album, Asset, requestPermissionsAsync } from 'expo-media-library';
import { showMessage } from 'react-native-flash-message';

import i18n from '@app/i18n';

import { captureException } from '@services/exceptionsHandler';

async function saveImageOnGallery(path: string): Promise<void> {
	const albumName = 'The Pet Gallery';
	const { granted, accessPrivileges } = await requestPermissionsAsync(false, [
		'photo',
	]);

	if (!granted) {
		showMessage({
			message: String(i18n.t('images.savePermissionError')),
			type: 'danger',
		});
		return;
	}

	const hasFullAccess =
		accessPrivileges === undefined || accessPrivileges === 'all';

	const cacheDirectory = new Directory(Paths.cache, 'images');
	cacheDirectory.create({ idempotent: true, intermediates: true });

	const extension = path.split('.').pop()?.split('?')[0] ?? 'jpg';
	const targetFile = new File(
		cacheDirectory,
		`image-${Date.now()}.${extension}`
	);
	let downloadedFile: File | null = null;

	try {
		downloadedFile = await File.downloadFileAsync(path, targetFile, {
			idempotent: true,
		});

		const asset = await Asset.create(downloadedFile.uri);

		if (hasFullAccess) {
			const album = await Album.get(albumName);

			if (album) {
				await album.add([asset]);
			} else {
				await Album.create(albumName, [asset], true);
			}
		}

		showMessage({
			message: String(i18n.t('images.saveSuccess')),
			type: 'success',
		});
	} catch (error) {
		captureException({
			error,
			showAlert: false,
		});

		showMessage({
			message: String(i18n.t('images.saveError')),
			type: 'danger',
		});
	} finally {
		if (downloadedFile?.exists) {
			downloadedFile.delete();
		}
	}
}

export { saveImageOnGallery };
