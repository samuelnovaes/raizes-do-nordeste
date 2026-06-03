import stylistic from '@stylistic/eslint-plugin';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['coverage/**']
  },
  {
    files: [
      'src/**/*.ts',
      'scripts/**/*.ts',
      'tests/**/*.ts'
    ],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      }
    },
    plugins: {
      '@stylistic': stylistic,
      '@typescript-eslint': tseslint
    },
    rules: {
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1 }],
      '@stylistic/comma-dangle': ['error', 'never'],
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-declaration-merging': 'off'
    }
  }
];
