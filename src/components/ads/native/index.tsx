import React, { useCallback, useEffect, useState } from 'react';
import { Platform, View, Text } from 'react-native';
import {
	NativeAd,
	NativeAdView,
	NativeAsset,
	NativeAssetType,
	NativeMediaView,
	NativeMediaAspectRatio,
	TestIds,
} from 'react-native-google-mobile-ads';

import Env from '@services/env';

import styles from './styles';

const AppNativeAd: React.FC = () => {
	const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);

	const loadData = useCallback(async () => {
		let adUnitId = TestIds.NATIVE;

		if (Platform.OS === 'ios' && !__DEV__) {
			adUnitId = Env.IOS_ADMOB_ADUNITID_NATIVE_BETWEEN_PETS_PICUTRES;
		} else if (Platform.OS === 'android' && !__DEV__) {
			adUnitId = Env.ANDROID_ADMOB_ADUNITID_NATIVE_BETWEEN_PETS_PICUTRES;
		}

		const nativeAd = await NativeAd.createForAdRequest(adUnitId, {
			aspectRatio: NativeMediaAspectRatio.ANY,
		});

		setNativeAd(nativeAd);
	}, []);

	useEffect(() => {
		loadData();
	}, []);

	useEffect(() => {
		if (!nativeAd) return;

		return () => {
			nativeAd.destroy();
		};
	}, [nativeAd]);

	if (nativeAd === null) return null;

	return (
		<View style={styles.container}>
			{nativeAd && (
				<NativeAdView nativeAd={nativeAd}>
					<View style={styles.content}>
						<NativeMediaView style={styles.media} />

						<View style={styles.textContainer}>
							<Text style={styles.sponsored}>Sponsored</Text>

							<NativeAsset assetType={NativeAssetType.HEADLINE}>
								<Text style={styles.headline}>
									{nativeAd.headline}
								</Text>
							</NativeAsset>

							{!!nativeAd.store && (
								<Text style={styles.store}>
									{nativeAd.store}
								</Text>
							)}
							{!!nativeAd.body && (
								<Text style={styles.body} numberOfLines={3}>
									{nativeAd.body}
								</Text>
							)}
						</View>
					</View>
				</NativeAdView>
			)}
		</View>
	);
};

export default AppNativeAd;
