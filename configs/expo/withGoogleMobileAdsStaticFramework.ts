import { ConfigPlugin, withPodfile } from '@expo/config-plugins';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';

/**
 * Builds RNGoogleMobileAds as a static framework.
 *
 * With `useFrameworks: 'dynamic'`, CocoaPods refuses to link a dynamic pod against
 * the statically linked `UserMessagingPlatform.xcframework` (a dependency of
 * Google Mobile Ads). RNGoogleMobileAds honors `$RNGoogleMobileAdsAsStaticFramework`.
 */
const withGoogleMobileAdsStaticFramework: ConfigPlugin = (config) => {
	return withPodfile(config, (podfileConfig) => {
		podfileConfig.modResults.contents = mergeContents({
			src: podfileConfig.modResults.contents,
			newSrc: '$RNGoogleMobileAdsAsStaticFramework = true',
			tag: 'rngma-static-framework',
			anchor: /prepare_react_native_project!/,
			offset: 0,
			comment: '#',
		}).contents;

		return podfileConfig;
	});
};

export default withGoogleMobileAdsStaticFramework;
