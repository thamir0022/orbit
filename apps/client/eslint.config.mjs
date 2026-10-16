import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import unusedImports from 'eslint-plugin-unused-imports'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      // Unused imports
      'unused-imports/no-unused-imports': 'warn',

      // Disable conflicting rules
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      // Unused variables and parameters
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])

export default eslintConfig
