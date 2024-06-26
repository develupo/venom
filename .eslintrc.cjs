// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  rules: {
    // @todo more restrictive
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/prefer-namespace-keyword': 'off',
    'no-async-promise-executor': 'off',
    'no-constant-condition': 'off',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-useless-catch': 'error',
    'no-useless-escape': 'error',
    'prefer-const': 2,
  },
  overrides: [
    {
      files: ['src/lib/**/*.js'],
      parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
      },
      env: {
        amd: true,
        commonjs: true,
        es6: true,
        browser: true,
        node: false,
      },
      globals: {
        axios: true,
        Debug: true,
        Store: true,
        WAPI: true,
        WWebJS: true,
      },
    },
    {
      files: ['src/lib/**/webpack.*.js', 'src/lib/**/gulpfile.js'],
      env: {
        browser: false,
        node: true,
      },
    },
  ],
}
