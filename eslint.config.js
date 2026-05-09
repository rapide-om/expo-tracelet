// ESLint flat config (ESLint 9+).
//
// Scope: TypeScript bridge + plugin code in `src/` and `plugin/src/`.
// Native code (Kotlin/Swift) and the auto-generated `tsconfig.json`/build
// outputs are out of scope.

const js = require('@eslint/js');
const tsEslint = require('typescript-eslint');
const globals = require('globals');

module.exports = [
    {
        ignores: ['build/', 'plugin/build/', 'node_modules/', '*.tsbuildinfo'],
    },
    js.configs.recommended,
    ...tsEslint.configs.recommended,
    {
        files: ['src/**/*.ts', 'plugin/src/**/*.ts'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.es2022,
            },
        },
        rules: {
            // Bridge code intentionally accepts/forwards Tracelet's untyped
            // payload maps; surfacing those at every callsite is noise.
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/no-require-imports': 'off',
            'no-console': 'off',
        },
    },
];
