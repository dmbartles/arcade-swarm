import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage', 'src/assets'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Enforce named constants over magic numbers (CLAUDE.md)
      '@typescript-eslint/no-inferrable-types': 'off',
      // Warn on any — allow for Phaser interop in some cases
      '@typescript-eslint/no-explicit-any': 'warn',
      // Unused vars: error but allow underscore-prefixed
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // No require() — ES modules only (CLAUDE.md)
      '@typescript-eslint/no-require-imports': 'error',
    },
  },
  {
    files: ['**/*.{test,spec}.{ts,js}', 'tests/**/*.{ts,js}', 'e2e/**/*.{ts,js}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
