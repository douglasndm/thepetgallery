import React, { useCallback, useEffect, useState } from 'react';
import { Platform, View, Text, Image } from 'react-native';
import {
	NativeAd,
	NativeAdView,
	NativeAsset,
	NativeAssetType,
	NativeMediaView,
	NativeMediaAspectRatio,
	TestIds,
	NativeAdEventType,
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

		NativeAd.createForAdRequest(TestIds.NATIVE)
			.then(setNativeAd)
			.catch(console.error);
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

	useEffect(() => {
		if (!nativeAd) return;

		const listener = nativeAd.addAdEventListener(
			NativeAdEventType.CLICKED,
			() => {
				console.log('Native ad clicked');
			}
		);
		return () => {
			nativeAd.destroy();
		};
	}, [nativeAd]);

	if (nativeAd === null) return null;

	return (
		<View style={styles.container}>
			<NativeAdView nativeAd={nativeAd}>
				<View style={styles.titleContainer}>
					{nativeAd.icon && (
						<NativeAsset assetType={NativeAssetType.ICON}>
							<Image
								source={{ uri: nativeAd.icon.url }}
								width={24}
								height={24}
							/>
						</NativeAsset>
					)}

					<NativeAsset assetType={NativeAssetType.HEADLINE}>
						<Text style={styles.title}>{nativeAd.headline}</Text>
					</NativeAsset>
				</View>

				<NativeMediaView />

				<Text style={styles.sponsored}>Sponsored</Text>
			</NativeAdView>
		</View>
	);
};

export default AppNativeAd;
