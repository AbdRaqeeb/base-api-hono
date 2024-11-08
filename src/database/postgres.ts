import knex, { Knex } from 'knex';
import Config from '../config';
import logger from '../log';

interface DatabaseAdapterOptions {
    connectionString: string;
    pool?: { min: number; max: number };
}

export const connection: DatabaseAdapterOptions = {
    connectionString: Config.databaseUrl,
};

export function createPgAdapter(connection: DatabaseAdapterOptions): Knex {
    const config: Knex.Config = {
        client: 'pg',
        connection,
        pool: connection.pool || {
            min: 3,
            max: 10,
        },
        debug: Config.nodeEnv === 'development', // 'local'?
        asyncStackTraces: Config.nodeEnv !== 'production',
        useNullAsDefault: true,
        searchPath: [Config.databaseSchema, 'public'],
        log: {
            warn(message) {
                logger.info(message, '[KNEX][WARN]');
            },
            error(message) {
                logger.error(message, '[KNEX][ERROR]');
            },
            deprecate(message) {
                logger.info({ message }, '[KNEX][DEPRECATE]');
            },
            debug(message) {
                logger.info(message, '[KNEX][DEBUG]');
            },
        },
    };

    return knex(config);
}
