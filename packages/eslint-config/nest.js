import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for NestJS applications.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const nestJsConfig = [
  ...baseConfig,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true, // Automatically finds apps/api/tsconfig.json
        sourceType: "module", // NestJS uses ES Module syntax in TS files
      },
      globals: {
        ...globals.node,
        ...globals.jest, // Essential for NestJS testing
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      // NestJS relies heavily on decorators and explicit any during initial dev
      "@typescript-eslint/no-explicit-any": "off", 
    },
  },
];

export default nestJsConfig;