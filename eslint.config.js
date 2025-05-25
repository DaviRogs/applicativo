// eslint.config.js
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react/configs/recommended.js';
import reactNative from 'eslint-plugin-react-native';
import pluginImport from 'eslint-plugin-import';
import pluginPrettier from 'eslint-plugin-prettier';
import hooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

/** @type {import("eslint").Linter.FlatConfig} */
export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/expo/**'],
  },
  {
    files: ['**/*.config.js', '**/*.config.cjs', 'babel.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      import: pluginImport,
    },
    rules: {
      'import/no-commonjs': 'off', // Desativa a regra que proíbe CommonJS
    },
  },
  js.configs.recommended,
  react,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'react-native': reactNative,
      import: pluginImport,
      prettier: pluginPrettier,
      'react-hooks': hooksPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...reactNative.environments['react-native'].globals,
        __DEV__: true,
        console: true,
        fetch: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        AbortController: 'readonly',
        URLSearchParams: 'readonly',
        window: 'readonly',
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
      'react-native/no-unused-styles': 'warn',
      'react-native/split-platform-components': 'warn', // Ou 'error'
      // 'react-native/no-inline-styles': 'warn',
      'react-native/no-raw-text': 'warn', // Para evitar texto fora de componentes <Text>
      // 'react-hooks/rules-of-hooks': 'error', // Verifica as regras dos Hooks
      // 'react-hooks/exhaustive-deps': 'warn', // Verifica dependências de effects
      'import/no-unresolved': 'off', // Desativa a verificação de módulos não resolvidos
    },
  },
  prettier,
];
