import { ConfigPlugin, withPodfile } from '@expo/config-plugins';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';

/**
 * Expo config plugin to ensure React Native Firebase dynamic framework pod targets
 * retain Objective-C categories like APMMeasurement(SBT) by including `-ObjC` in `OTHER_LDFLAGS`.
 *
 * Without `-ObjC` on the RNFB dynamic framework pod targets, the linker drops
 * static library categories (such as `APMMeasurement+SBT.o` in GoogleAppMeasurement),
 * causing a crash at launch when remote config arrives:
 * `NSInvalidArgumentException: -[APMMeasurement fetchSBT]: unrecognized selector sent to instance`.
 *
 * @param config - The Expo config to modify.
 * @returns The modified Expo config with the Podfile post_install hook.
 */
const withFirebaseLinkerFix: ConfigPlugin = (config) => {
	return withPodfile(config, (podfileConfig) => {
		const snippet = `    # [RNFB Fix] Ensure React Native Firebase pod targets include -ObjC to retain ObjC categories
    installer.pods_project.targets.each do |target|
      if target.name.start_with?('RNFB')
        target.build_configurations.each do |config|
          flags = config.build_settings['OTHER_LDFLAGS'] || '$(inherited)'
          flags = flags.is_a?(Array) ? flags : flags.split
          unless flags.include?('-ObjC')
            flags << '-ObjC'
            config.build_settings['OTHER_LDFLAGS'] = flags
          end
        end
      end
    end
    installer.pods_project.save`;

		podfileConfig.modResults.contents = mergeContents({
			src: podfileConfig.modResults.contents,
			newSrc: snippet,
			tag: 'rnfb-objc-linker-fix',
			anchor: /post_install do \|installer\|/,
			offset: 1,
			comment: '#',
		}).contents;

		return podfileConfig;
	});
};

export default withFirebaseLinkerFix;
