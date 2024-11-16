import type { Knex } from 'knex';
import { PUBLIC_SCHEMA } from '../schemas';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE OR REPLACE FUNCTION ${PUBLIC_SCHEMA}.set_updated_timestamp()
            RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`DROP FUNCTION IF EXISTS ${PUBLIC_SCHEMA}.set_updated_timestamp() CASCADE;`);
}
