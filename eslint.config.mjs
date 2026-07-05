import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';

export default tseslint.config(
    {
        ignores:
        [
            '**/dist/**',
            '**/node_modules/**',
            'sources/**',
            '**/*.d.ts'
        ]
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['packages/*/src/**/*.ts'],
        languageOptions:
        {
            globals: { ...globals.browser }
        },
        plugins: { '@stylistic': stylistic },
        rules:
        {
            '@stylistic/brace-style': ['error', 'allman', { allowSingleLine: true }],
            '@stylistic/indent': ['error', 4],
            '@stylistic/keyword-spacing': ['error', { overrides:
            {
                if: { after: false },
                for: { after: false },
                while: { after: false },
                switch: { after: false },
                catch: { after: false }
            } }],
            '@stylistic/space-before-function-paren': ['error', { anonymous: 'never', named: 'never', asyncArrow: 'always' }],
            '@stylistic/function-call-spacing': ['error', 'never'],
            '@stylistic/comma-spacing': ['error', { before: false, after: true }],
            '@stylistic/space-infix-ops': 'error',
            '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
            '@stylistic/padded-blocks': ['error', 'never'],
            '@stylistic/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],

            'no-console': 'error',
            'no-restricted-syntax':
            [
                'error',
                { selector: 'ExportDefaultDeclaration', message: 'Named exports only — never use `export default` (docs/STYLEGUIDE.md).' },
                { selector: 'TSUnionType > TSUndefinedKeyword', message: 'Use `| null`, not `| undefined`, in type annotations (docs/STYLEGUIDE.md).' }
            ],

            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'separate-type-imports' }],
            '@typescript-eslint/naming-convention':
            [
                'error',
                { selector: 'class', format: ['PascalCase'] },
                { selector: 'interface', format: ['PascalCase'], prefix: ['I'] },
                { selector: 'enumMember', format: ['PascalCase'] },
                { selector: 'classProperty', modifiers: ['static', 'readonly'], format: ['UPPER_CASE'] },
                { selector: 'classProperty', modifiers: ['private'], format: ['camelCase'], leadingUnderscore: 'require' },
                { selector: 'classProperty', modifiers: ['protected'], format: ['camelCase'], leadingUnderscore: 'require' },
                { selector: 'classProperty', modifiers: ['public'], format: ['camelCase'], leadingUnderscore: 'forbid' },
                { selector: 'method', format: ['camelCase'] }
            ]
        }
    },
    {
        files: ['**/*.mjs'],
        languageOptions: { globals: { ...globals.node } }
    }
);
