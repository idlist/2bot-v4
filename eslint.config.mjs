import js from '@eslint/js'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.commonjs,
      },
    },
    rules: {
      // Set some rules from error to warining
      'no-empty': 'warn',
      'no-unused-vars': 'warn',
      'prefer-const': 'warn',

      // Coding styles
      'indent': ['warn', 2, { SwitchCase: 1 }],
      'semi': ['warn', 'never'],
      'quotes': ['warn', 'single'],
      'comma-dangle': ['warn', 'always-multiline'],
      'arrow-parens': ['warn', 'always'],
    },
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
    },
  },
]