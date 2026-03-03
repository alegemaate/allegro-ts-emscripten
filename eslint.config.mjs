import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

const __dirname = new URL(".", import.meta.url).pathname;

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config}
 * */
export default defineConfig(
  {
    ignores: [
      "node_modules/**",
      "eslint.config.mjs",
      "build/**",
      "examples/**",
      "lib/**",
    ],
  },
  js.configs.all,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  eslintConfigPrettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    rules: {
      "one-var": "off",
      "sort-keys": "off",
      "no-ternary": "off",
      "sort-imports": "off",
      camelcase: "off",
      "new-cap": "off",
      "no-undefined": "off",
      "no-shadow": "off",
      "no-use-before-define": "off",
      "no-bitwise": "off",
      "id-length": "off",
      "no-inline-comments": "off",
      "no-underscore-dangle": "off",
      "no-void": "off",
      "capitalized-comments": "off",
      "init-declarations": "off",
      "func-names": "off",
      "object-shorthand": "off",

      "max-classes-per-file": "off",
      "class-methods-use-this": "off",
      "max-lines-per-function": "off",
      "max-statements": "off",
      "max-params": "off",
      "no-magic-numbers": "off",
      complexity: "off",
      "func-style": "off",
      "no-plusplus": "off",
      "max-lines": "off",
      "no-continue": "off",

      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/prefer-readonly-parameter-types": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/no-type-alias": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/parameter-properties": "off",
      "@typescript-eslint/no-import-type-side-effects": "off",
      "@typescript-eslint/no-base-to-string": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-deprecated": "off",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
);
