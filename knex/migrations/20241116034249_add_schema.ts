import type { Knex } from 'knex';
import { SETTINGS } from '../schemas';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE SCHEMA IF NOT EXISTS ${SETTINGS};
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DROP SCHEMA IF EXISTS ${SETTINGS};
    `);
}
