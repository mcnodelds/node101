import pluginJs from "@eslint/js";
import globals from "globals";
import jsdoc from "eslint-plugin-jsdoc";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
    pluginJs.configs.recommended,
    jsdoc.configs["flat/recommended"],
    eslintPluginPrettierRecommended,
    {
        plugins: {
            jsdoc,
        },
        languageOptions: {
            sourceType: "module",
            globals: {
                ...globals.node,
            },
        },
    },
];
