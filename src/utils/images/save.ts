import { Directory, File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { showMessage } from 'react-native-flash-message';

import i18n from '@app/i18n';

async function saveImageOnGallery(path: string): Promise<void> {
	const albumName = 'The Pet Gallery';
	const { granted } = await MediaLibrary.requestPermissionsAsync();

	if (!granted) {
		showMessage({
			message: String(i18n.t('images.savePermissionError')),
			type: 'danger',
		});
		return;
	}

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

		const asset = await MediaLibrary.createAssetAsync(downloadedFile.uri);
		const existingAlbum = await MediaLibrary.getAlbumAsync(albumName);

		if (existingAlbum) {
			await MediaLibrary.addAssetsToAlbumAsync(
				[asset],
				existingAlbum,
				false
			);
		} else {
			await MediaLibrary.createAlbumAsync(albumName, asset, false);
		}

		showMessage({
			message: String(i18n.t('images.saveSuccess')),
			type: 'success',
		});
	} catch {
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
