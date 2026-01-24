import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import onlyWarn from "eslint-plugin-only-warn";

/**
 * A shared base ESLint configuration for the Orbit monorepo.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  // 1. Core Recommended Configs
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 2. Base Ignores for the whole monorepo
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/.turbo/**"],
  },

  // 3. Plugins & Rules configuration
  {
    plugins: {
      turbo: turboPlugin,
      "only-warn": onlyWarn,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",

      // Note: Removed the "semi" rule because Prettier handles formatting.
      // If you enforce it here, ESLint and Prettier will fight each other.
    },
  },

  // 4. Prettier integration (Must be last to override formatting rules)
  eslintConfigPrettier,
];