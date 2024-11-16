import type { Knex } from 'knex';
import * as schema from '../schemas';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE SCHEMA IF NOT EXISTS ${schema.ACCOUNT_SCHEMA};
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DROP SCHEMA IF EXISTS ${schema.ACCOUNT_SCHEMA};
    `);
}
