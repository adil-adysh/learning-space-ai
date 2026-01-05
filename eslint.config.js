import svelteParser from 'svelte-eslint-parser';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import sveltePlugin from 'eslint-plugin-svelte';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const tsRecommended = tsPlugin.configs?.recommended ?? {};
const tsTypeChecking = tsPlugin.configs?.['recommended-requiring-type-checking'] ?? {};
const tsBaseRules = {
  ...(tsRecommended.rules ?? {}),
  ...(tsTypeChecking.rules ?? {}),
};
const svelteRecommended = sveltePlugin.configs?.recommended ?? {};

const sharedGlobals = {
  console: 'readonly',
  process: 'readonly',
  require: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  Buffer: 'readonly',
  global: 'readonly',
};

export default [
  {
    ignores: ['node_modules', 'dist', 'build', '.svelte-kit', 'coverage', '*.log', '.DS_Store'],
  },
  {
    files: ['src/**/*.{js,ts}'],
    languageOptions: {
      ...tsRecommended.languageOptions,
      ...tsTypeChecking.languageOptions,
      parser: tsParser,
      parserOptions: {
        ...(tsRecommended.languageOptions?.parserOptions ?? {}),
        ...(tsTypeChecking.languageOptions?.parserOptions ?? {}),
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: sharedGlobals,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsBaseRules,
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      semi: ['error', 'always'],
      indent: 'off',
      'no-console': 'warn',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': ['error', { checksConditionals: true }],
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true, allowNullish: true },
      ],
    },
  },
  {
    files: ['scripts/**/*.{js,cjs}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
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
      ...svelteRecommended.languageOptions,
      parser: svelteParser,
      parserOptions: {
        ...(svelteRecommended.languageOptions?.parserOptions ?? {}),
        parser: tsParser,
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
        extraFileExtensions: ['.svelte'],
      },
      globals: {
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
      },
    },
    plugins: {
      svelte: sveltePlugin,
    },
    rules: {
      ...svelteRecommended.rules,
      'svelte/no-at-html-tags': 'off',
      'no-debugger': 'error',
      'svelte/require-wo-class': 'off',
    },
  },
];
