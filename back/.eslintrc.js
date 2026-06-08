module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:n/ recommended-compatible'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'require-await': 'error',
    'no-implicit-globals': 'error',
    'no-restricted-syntax': ['error', 'ForInStatement'], // Disallow for..in loops
  },
  plugins: ['n'],
};
