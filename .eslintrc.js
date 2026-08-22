module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['./tsconfig.json'],
        sourceType: 'module',
        extraFileExtensions: ['.json'],
    },
    ignorePatterns: ['.eslintrc.js', '**/*.js', '**/node_modules/**', '**/dist/**'],
    extends: ['plugin:n8n-nodes-base/nodes'],
    overrides: [
        {
            files: ['package.json'],
            parser: 'jsonc-eslint-parser',
            extends: ['plugin:n8n-nodes-base/community'],
            rules: {
                'n8n-nodes-base/community-package-json-name-still-default': 'off',
            },
        },
    ],
};