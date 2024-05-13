import { defineConfig, coverageConfigDefaults, defaultExclude } from 'vitest/config';

export default defineConfig({
    test: {
        name: 'node',
        environment: 'node',
        setupFiles: ['./setup-test.node.ts'],
        testTimeout: 10_000,
        exclude: ['<rootDir>/tests/utils/', '**/*.mjs', ...defaultExclude],
        coverage: {
            exclude: ['<rootDir>/tests/utils/', '**/*.mjs', ...coverageConfigDefaults.exclude],
        },
    },
});
