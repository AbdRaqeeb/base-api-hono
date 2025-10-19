import type { Knex } from 'knex';
import { PUBLIC_SCHEMA } from '../schemas';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        ALTER TABLE ${PUBLIC_SCHEMA}.accounts
            ADD COLUMN IF NOT EXISTS refresh_token_expires_at TIMESTAMPTZ;
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        ALTER TABLE ${PUBLIC_SCHEMA}.accounts
            DROP COLUMN IF EXISTS refresh_token_expires_at;
    `);
}
