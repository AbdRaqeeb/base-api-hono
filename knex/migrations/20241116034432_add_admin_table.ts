import type { Knex } from 'knex';
import { ACCOUNT_SCHEMA } from '../schemas';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS ${ACCOUNT_SCHEMA}.admins (
            id                  SERIAL PRIMARY KEY,
            username            VARCHAR(255) UNIQUE         NOT NULL,
            first_name          VARCHAR(255)                NULL,
            last_name           VARCHAR(255)                NULL,
            email               VARCHAR(255) UNIQUE         NOT NULL,
            "password"          VARCHAR(255)                NOT NULL,
            is_active           BOOLEAN                     NOT NULL DEFAULT true,
            is_newly_created    BOOLEAN                     NOT NULL DEFAULT true,
            "role"              VARCHAR(20) DEFAULT 'admin' NOT NULL,
            created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at          TIMESTAMP WITHOUT TIME ZONE NULL
        );
    `);

    // add trigger for update timestamp
    await knex.raw(`    
        DROP TRIGGER IF EXISTS admin_set_update_timestamp ON ${ACCOUNT_SCHEMA}.admins;
        CREATE TRIGGER admin_set_update_timestamp
            BEFORE UPDATE
            ON ${ACCOUNT_SCHEMA}.admins
            FOR EACH ROW
            EXECUTE FUNCTION set_updated_timestamp();
    `);

    // create indexes on admin
    await knex.raw(`
        CREATE INDEX IF NOT EXISTS admin_username_idx ON ${ACCOUNT_SCHEMA}.admins (LOWER(username));
        CREATE INDEX IF NOT EXISTS admin_active_idx ON ${ACCOUNT_SCHEMA}.admins (is_active);
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DROP TRIGGER IF EXISTS admin_set_update_timestamp ON ${ACCOUNT_SCHEMA}.admins;
        DROP TABLE IF EXISTS ${ACCOUNT_SCHEMA}.admins;
    `);
}
