export default {
    development: {
        client: 'pg',
        connection: { connectionString: process.env.DATABASE_URL },
        pool: { min: 2, max: 10 },
        migrations: { directory: __dirname + '/migrations' },
        seeds: { directory: __dirname + '/seeders' },
    },
    test: {
        client: 'pg',
        connection: { connectionString: process.env.DATABASE_URL },
        migrations: { directory: __dirname + '/migrations' },
        pool: { min: 2, max: 10 },
        seeds: { directory: __dirname + '/seeders' },
    },
    production: {
        client: 'pg',
        connection: { connectionString: process.env.DATABASE_URL },
        migrations: { directory: __dirname + '/migrations' },
        seeds: { directory: __dirname + '/seeders' },
        pool: { min: 2, max: 10 },
    },
};
