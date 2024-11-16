import type { Knex } from 'knex';
import { ACCOUNT_SCHEMA } from '../schemas';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS ${ACCOUNT_SCHEMA}.users (
            id                  SERIAL PRIMARY KEY,
            first_name          VARCHAR(255)                NULL,
            last_name           VARCHAR(255)                NULL,
            email               VARCHAR(255) UNIQUE         NOT NULL,
            phone               VARCHAR(100)                NULL,
            age_range           VARCHAR(255)                NULL,
            avatar_url          VARCHAR(255)                NULL,
            "password"          VARCHAR(255)                NULL,
            country             VARCHAR(255)                NULL,
            sign_up_reason      VARCHAR(255)                NULL,
            firebase_uid        VARCHAR(255)                NULL,
            metadata            JSONB                       NULL,
            is_active           BOOLEAN                     NOT NULL DEFAULT true,
            is_email_verified   BOOLEAN                     NOT NULL DEFAULT false,
            created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at          TIMESTAMP WITHOUT TIME ZONE NULL
        );
    `);

    // add trigger for update timestamp
    await knex.raw(`    
        DROP TRIGGER IF EXISTS user_set_update_timestamp ON ${ACCOUNT_SCHEMA}.users;
        CREATE TRIGGER user_set_update_timestamp
            BEFORE UPDATE
            ON ${ACCOUNT_SCHEMA}.users
            FOR EACH ROW
        EXECUTE FUNCTION
            set_updated_timestamp();
    `);

    // create indexes on users
    await knex.raw(`
        CREATE INDEX IF NOT EXISTS user_is_active_idx ON ${ACCOUNT_SCHEMA}.users (is_active);
        CREATE INDEX IF NOT EXISTS user_firebase_uid_idx ON ${ACCOUNT_SCHEMA}.users (firebase_uid);
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DROP TRIGGER IF EXISTS user_set_update_timestamp ON ${ACCOUNT_SCHEMA}.users;
        DROP TABLE IF EXISTS ${ACCOUNT_SCHEMA}.users;
    `);
}
