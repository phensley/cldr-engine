import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['**/dist/*', '**/node_modules/*', '**/lib/*'],
  },
  {
    files: [
      'packages/*/src/**/*.ts',
      'packages/*/__stress__/**/*.ts',
      'packages/*/__tests__/**/*.ts',
      'packages/*/__benchmarks__/**/*.ts',
    ],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier,
    },
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'max-len': ['error', { code: 120 }],
      'prefer-const': 'off', // typescript compiler catches this and is more flexible
      '@typescript-eslint/camelcase': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-duplicate-enum-values': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_.*$', varsIgnorePattern: '^_.*$' }],
      '@typescript-eslint/no-use-before-define': 'off',
      // warn prettier for now
      'prettier/prettier': 'warn',
    },
  },
]);
