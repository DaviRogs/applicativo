// eslint.config.js
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react/configs/recommended.js';
import reactNative from 'eslint-plugin-react-native';
import pluginImport from 'eslint-plugin-import';
import pluginPrettier from 'eslint-plugin-prettier';

/** @type {import("eslint").Linter.FlatConfig} */
export default [
  js.configs.recommended,
  react,
  {
    plugins: {
      'react-native': reactNative,
      import: pluginImport,
      prettier: pluginPrettier,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        __DEV__: true,
        console: true,
        fetch: 'readonly',
        window: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        Blob: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        AbortController: 'readonly',
        URLSearchParams: 'readonly',
        document: 'readonly',
        FileReader: 'readonly',
        localStorage: 'readonly', // Se for usado apenas no navegador
        require: 'readonly',
        module: 'readonly', // Para uso em arquivos como babel.config.js
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'prettier/prettier': 'error',
      'react/prop-types': 'off',
    },
  },
  prettier,
];
