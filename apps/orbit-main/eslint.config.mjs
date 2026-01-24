import { nextJsConfig } from '@orbit/eslint-config/next.js'

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      'eslint.config.mjs',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '.next/**',
      '**/*.min.js',
      '**/*.bundle.js',
      '**/coverage/**',
    ],
  },
  ...nextJsConfig,
]
