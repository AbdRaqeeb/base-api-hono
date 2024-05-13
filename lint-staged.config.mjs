export default {
    'src/**/*.ts': () => ['yarn run type:check'],

    '**/*.{ts,js}': () => ['yarn run lint', 'yarn run prettier:fix'],
};
