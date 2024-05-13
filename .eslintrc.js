module.exports = {
    parser: '@typescript-eslint/parser',
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    env: {
        es6: true,
        node: true,
    },
    rules: {
        'no-empty': 'warn',
        'prefer-const': ['error', { destructuring: 'all' }],
        'no-useless-catch': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/indent': 'off', // clashes with prettier
        '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/ban-ts-comment': 'warn',
        'no-useless-escape': 'off',
    },
};
