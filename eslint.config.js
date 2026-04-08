const {
    defineConfig,
} = require("eslint/config");

const reactHooks = require("eslint-plugin-react-hooks");
const prettier = require("eslint-plugin-prettier");
const jest = require("eslint-plugin-jest");

const {
    fixupPluginRules,
} = require("@eslint/compat");

const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    extends: compat.extends("@react-native", "prettier"),

    plugins: {
        "react-hooks": fixupPluginRules(reactHooks),
        prettier,
        jest,
    },

    rules: {
        "react-hooks/rules-of-hooks": "off",
        "prettier/prettier": "error",
        "react-native/no-inline-styles": "off",
    },
}]);
