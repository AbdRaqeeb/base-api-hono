export default {
    'src/**/*.ts': () => ['bun run type:check'],

    '**/*.{ts,js}': () => ['bun run lint', 'bun run format:fix'],
};
