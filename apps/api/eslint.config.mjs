import { nestJsConfig } from '@orbit/eslint-config/nest.js';

/** @type {import("eslint").Linter.Config} */
export default [
  {
    ignores: ['eslint.config.mjs'],
  },
  ...nestJsConfig,
];
