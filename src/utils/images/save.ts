import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import RNFetchBlob from 'rn-fetch-blob';
import { showMessage } from 'react-native-flash-message';

import i18n from '@app/i18n';
import { requestSavePermission } from '@utils/permissions/check';

async function saveImageOnGallery(path: string): Promise<void> {
	const extension = path.split('.').pop();

	const hasPermission = await requestSavePermission();

	if (!hasPermission) {
		showMessage({
			message: i18n.t('images.savePermissionError'),
			type: 'danger',
		});
		return;
	}

	const config = RNFetchBlob.config({
		fileCache: true,
		appendExt: extension, // Extensão do arquivo
	});

	const result = await config.fetch('GET', path);

	await CameraRoll.saveAsset(result.path(), {
		type: 'photo',
		album: 'The Pet Gallery',
	});

	showMessage({
		message: i18n.t('images.saveSuccess'),
		type: 'success',
	});
}

export { saveImageOnGallery };
