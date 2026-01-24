import { config as baseConfig } from './base.js'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'

/**
 * A custom ESLint configuration for Node.js/TypeScript libraries.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const libraryConfig = [
  // 1. Extend the base configuration
  ...baseConfig,

  // 2. Global Ignores for libraries
  {
    ignores: ['**/node_modules/', '**/dist/', '**/*.config.js'],
  },

  // 3. Language & Parser Options
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js'],
    languageOptions: {
      parser: tsParser, // Assign the TS parser here
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json', // Enables type-aware linting
      },
      // ESLint v9 replaces `env: { node: true }` with the `globals` package
      globals: {
        ...globals.node,
      },
    },
    // Optional: Only keep this if you are using 'eslint-plugin-import'
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },
]

export default libraryConfig
