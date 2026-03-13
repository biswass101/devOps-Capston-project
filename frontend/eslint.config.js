import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';

export default [
  {
    ignores: ['dist/**']
  },
  js.configs.recommended,
  reactPlugin.configs.flat.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      'no-console': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off'
    }
  }
];
