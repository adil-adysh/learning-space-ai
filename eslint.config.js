import svelteParser from 'svelte-eslint-parser';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['node_modules', 'dist', 'build', '.svelte-kit', 'coverage', '*.log', '.DS_Store'],
  },
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      semi: ['error', 'always'],
      indent: ['error', 2],
    },
  },
  {
    files: ['scripts/**/*.{js,cjs}', 'src/main.ts', 'src/preload.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['src/lib/**'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.svelte'],
      },
      globals: {
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
      },
    },
    rules: {
      'svelte/no-at-html-tags': 'off',
      'no-debugger': 'error',
    },
  },
];
