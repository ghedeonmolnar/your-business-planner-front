const reactNativeConfig = require('@react-native/eslint-config/flat');
const boundaries = require('eslint-plugin-boundaries');
const architecture = require('./tools/architecture/boundaries.cjs');

const internalImports = { patterns: ['./*', '../*'] };

module.exports = [
  ...reactNativeConfig.filter(config => !config.plugins?.['ft-flow']),
  {
    ignores: ['src/shared/api/generated/**'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/**/*.d.ts',
      'src/**/*.test.*',
      'src/**/*{.testUtils,TestUtils,TestFixtures,TestHelpers}.*',
      'src/shared/test/**',
    ],
    plugins: { boundaries },
    settings: {
      'boundaries/root-path': __dirname,
      'boundaries/elements': architecture.elements,
      'boundaries/files': [
        {
          pattern:
            'src/**/*{.test,testUtils,TestUtils,TestFixtures,TestHelpers}.*',
          category: 'test',
        },
      ],
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
    },
    rules: {
      'boundaries/dependencies': ['error', architecture.dependencies],
      'boundaries/no-unknown-dependencies': 'error',
      'boundaries/no-unknown-files': 'error',
    },
  },
  {
    rules: {
      'react/no-unstable-nested-components': ['warn', { allowAsProps: true }],
      'no-void': ['error', { allowAsStatement: true }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      'no-restricted-imports': ['error', internalImports],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/features/**/hooks/**',
      'src/**/*.test.*',
      'src/shared/test/**',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          ...internalImports,
          paths: [
            {
              name: '@tanstack/react-query',
              importNames: ['useQuery', 'useInfiniteQuery', 'useMutation'],
              message:
                'Server state se gestioneaza prin hook-urile feature-ului.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    ignores: ['src/**/*.test.*'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: 'Foloseste API-ul feature-ului si clientul HTTP comun.',
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/shared/monitoring/reportError.ts', 'src/**/*.test.*'],
    rules: {
      'no-console': 'error',
    },
  },
];
