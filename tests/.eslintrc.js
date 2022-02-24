module.exports = {
  env: {
    'jasmine': true,
    'jest': true,
  },
  extends: [
    '../.eslintrc.js',
  ],
  rules: {
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'no-control-regex': 'off',
    'no-empty': 'off',
  },
};
