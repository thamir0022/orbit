import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginNext from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";
import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for Next.js applications.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const nextJsConfig = [
  // 1. Base Config (already includes JS, TS, and basic ignores)
  ...baseConfig,

  // 2. React Core Setup
  {
    ...pluginReact.configs.flat.recommended,
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser, // Next.js Client Components
        ...globals.node,    // Next.js Server Components/API Routes
        ...globals.serviceworker,
      },
    },
    settings: {
      react: { version: "detect" },
    },
  },

  // 3. Next.js and React Hooks Plugins
  {
    plugins: {
      "@next/next": pluginNext,
      "react-hooks": pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules,
      "react/react-in-jsx-scope": "off", // Not needed in Next.js
      "react/prop-types": "off", // TypeScript handles prop types
    },
  },

  // 4. Prettier (MUST BE LAST)
  eslintConfigPrettier,
];

export default nextJsConfig;