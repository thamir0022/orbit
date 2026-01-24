import { libraryConfig } from '@orbit/eslint-config/library.js'

/** @type {import("eslint").Linter.Config[]} */
export default [
  // 1. Global Ignores (Must be in its own object)
  {
    ignores: ['apps/**', 'packages/**', 'dist/**', 'node_modules/**'],
  },

  // 2. Extend your shared library config
  ...libraryConfig,

  // 3. Root-specific overrides
  {
    files: ['**/*.ts', '**/*.tsx'], // Apply overrides only to TS files
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
]
