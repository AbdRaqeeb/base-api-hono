export default {
    development: {
        client: 'pg',
        connection: { connectionString: process.env.DATABASE_URL },
        pool: { min: 2, max: 10 },
        migrations: { directory: __dirname + '/migrations' },
        seeds: { directory: __dirname + '/seeds' },
    },
    test: {
        client: 'pg',
        connection: { connectionString: process.env.DATABASE_URL },
        migrations: { directory: __dirname + '/migrations' },
        pool: { min: 2, max: 10 },
        seeds: { directory: __dirname + '/seeds' },
    },
    production: {
        client: 'pg',
        connection: { connectionString: process.env.DATABASE_URL },
        migrations: { directory: __dirname + '/migrations' },
        seeds: { directory: __dirname + '/seeds' },
        pool: { min: 2, max: 10 },
    },
};
