// eslint.config.js (ESLint v9 flat config)
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactNative from 'eslint-plugin-react-native';
import unusedImports from 'eslint-plugin-unused-imports';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '.expo/',
      '.expo-shared/',
      'android/',
      'ios/',
      'expo-env.d.ts',
    ],
  },

  js.configs.recommended,

  // TypeScript (non type-checked สำหรับความเร็ว; เปิด type-checked ได้ภายหลัง)
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        // ถ้าจะเปิด type-aware lint ให้เพิ่ม tsconfig แล้วใช้ configs.recommendedTypeChecked
        projectService: true,
        tsconfigRootDir: process.cwd(),
        ecmaFeatures: { jsx: true },
      },
      globals: {
        JSX: 'readonly',
        __DEV__: 'readonly',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-native': reactNative,
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // React & Hooks
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React Native
      'react-native/no-unused-styles': 'warn',
      'react-native/no-inline-styles': 'off', // เปิดเป็น 'warn' ถ้าอยากเข้มงวด
      'react-native/no-color-literals': 'off',
      'react-native/no-raw-text': 'off',

      // Imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',

      // JS/TS
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off', // ปิดของ ESLint เอง ใช้ของ unused-imports แทน
      '@typescript-eslint/no-unused-vars': 'off',

      // ให้ Prettier เป็นคนจัด format (ปิดกฎขัดแย้ง)
      'prettier/prettier': 'off',
    },
  },
];
