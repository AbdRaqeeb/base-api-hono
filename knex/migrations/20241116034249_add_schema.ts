import type { Knex } from 'knex';
import { SETTINGS, APP_SCHEMA } from '../schemas';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE SCHEMA IF NOT EXISTS ${SETTINGS};
        CREATE SCHEMA IF NOT EXISTS ${APP_SCHEMA};
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DROP SCHEMA IF EXISTS ${SETTINGS};
        DROP SCHEMA IF EXISTS ${APP_SCHEMA};
    `);
}
