import { ConfigPlugin, withProjectBuildGradle } from "@expo/config-plugins";

const withKotlinMetadataFix: ConfigPlugin = (config) => {
    return withProjectBuildGradle(config, (config) => {
        if (
            !config.modResults.contents.includes(
                "-Xskip-metadata-version-check",
            )
        ) {
            config.modResults.contents += `
allprojects {
  tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
    compilerOptions {
      freeCompilerArgs.add("-Xskip-metadata-version-check")
    }
  }
}
`;
        }
        return config;
    });
};

export default withKotlinMetadataFix;
