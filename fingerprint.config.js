const { DEFAULT_SOURCE_SKIPS, SourceSkips } = require('@expo/fingerprint');

/** @type {import('@expo/fingerprint').Config} */
module.exports = {
	ignorePaths: ['version.json'],
	sourceSkips: DEFAULT_SOURCE_SKIPS | SourceSkips.ExpoConfigVersions,
};
