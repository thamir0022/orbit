import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import tsParser from '@typescript-eslint/parser'
import globals from 'globals'
import eslintConfigPrettier from 'eslint-config-prettier'
import { config as baseConfig } from './base.js'

/**
 * A custom ESLint configuration for internal React component libraries (e.g., @orbit/ui).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  // 1. Base Config (includes JS, TS, Turbo plugin, and basic ignores)
  ...baseConfig,

  // 2. React Core Setup
  {
    ...pluginReact.configs.flat.recommended,
    files: ['**/*.ts', '**/*.tsx', '**/*.jsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true, // Finds the tsconfig.json inside packages/ui
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser, // UI components run in the browser
        ...globals.serviceworker,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
  },

  // 3. React Hooks Plugin & Rules
  {
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Modern React doesn't need the React import
      'react/prop-types': 'off', // You are using TypeScript for prop validation
    },
  },

  // 4. Prettier (MUST BE LAST to override conflicting rules)
  eslintConfigPrettier,
]
