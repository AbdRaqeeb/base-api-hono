import type { Knex } from 'knex';
import { PUBLIC_SCHEMA } from '../schemas';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS ${PUBLIC_SCHEMA}.users
        (
            id                 TEXT      NOT NULL PRIMARY KEY,
            full_name          TEXT      NOT NULL,
            email              TEXT      NOT NULL UNIQUE,
            username           TEXT      NOT NULL UNIQUE,
            email_verified     BOOLEAN   NOT NULL,
            image              TEXT      NULL,
            first_name         TEXT      NULL,
            last_name          TEXT      NULL,
            "role"             TEXT      NULL,
            display_username   TEXT      NULL,
            two_factor_enabled BOOLEAN   NULL,
            banned             BOOLEAN   NULL,
            ban_reason         TEXT      NULL,
            ban_expires        TIMESTAMP NULL,
            created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at         TIMESTAMP NULL
        );

        -- add indexes
        CREATE INDEX IF NOT EXISTS idx_users_email ON ${PUBLIC_SCHEMA}.users (email);
        CREATE INDEX IF NOT EXISTS idx_users_email_verified ON ${PUBLIC_SCHEMA}.users (email_verified);
        CREATE INDEX IF NOT EXISTS idx_users_username ON ${PUBLIC_SCHEMA}.users (username);

        -- add triggers
        DROP TRIGGER IF EXISTS user_set_update_timestamp ON ${PUBLIC_SCHEMA}.users;
        CREATE TRIGGER user_set_update_timestamp
            BEFORE UPDATE
            ON ${PUBLIC_SCHEMA}.users
            FOR EACH ROW
        EXECUTE FUNCTION
            set_updated_timestamp();

        CREATE TABLE IF NOT EXISTS ${PUBLIC_SCHEMA}.sessions
        (
            id              TEXT      NOT NULL PRIMARY KEY,
            expires_at      TIMESTAMP NOT NULL,
            token           TEXT      NOT NULL UNIQUE,
            created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at      TIMESTAMP NULL,
            ip_address      TEXT      NULL,
            user_agent      TEXT      NULL,
            impersonated_by TEXT      NULL,
            user_id         TEXT      NOT NULL REFERENCES ${PUBLIC_SCHEMA}.users (id)
        );

        -- add indexes
        CREATE INDEX IF NOT EXISTS idx_sessions_token ON ${PUBLIC_SCHEMA}.sessions (token);
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON ${PUBLIC_SCHEMA}.sessions (user_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON ${PUBLIC_SCHEMA}.sessions (expires_at);

        -- add triggers
        DROP TRIGGER IF EXISTS session_set_update_timestamp ON ${PUBLIC_SCHEMA}.sessions;
        CREATE TRIGGER session_set_update_timestamp
            BEFORE UPDATE
            ON ${PUBLIC_SCHEMA}.sessions
            FOR EACH ROW
        EXECUTE FUNCTION
            set_updated_timestamp();

        CREATE TABLE IF NOT EXISTS ${PUBLIC_SCHEMA}.accounts
        (
            id                      TEXT      NOT NULL PRIMARY KEY,
            account_id              TEXT      NOT NULL,
            provider_id             TEXT      NOT NULL,
            user_id                 TEXT      NOT NULL REFERENCES ${PUBLIC_SCHEMA}.users (id),
            access_token            TEXT,
            refresh_token           TEXT,
            id_token                TEXT,
            access_token_expires_at TIMESTAMP,
            scope                   TEXT,
            "password"              TEXT,
            created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at              TIMESTAMP NULL
        );

        -- add indexes
        CREATE INDEX IF NOT EXISTS idx_accounts_provider_id ON ${PUBLIC_SCHEMA}.accounts (provider_id);
        CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON ${PUBLIC_SCHEMA}.accounts (user_id);

        -- add triggers
        DROP TRIGGER IF EXISTS account_set_update_timestamp ON ${PUBLIC_SCHEMA}.accounts;
        CREATE TRIGGER account_set_update_timestamp
            BEFORE UPDATE
            ON ${PUBLIC_SCHEMA}.accounts
            FOR EACH ROW
        EXECUTE FUNCTION
            set_updated_timestamp();

        CREATE TABLE IF NOT EXISTS ${PUBLIC_SCHEMA}.verifications
        (
            id         TEXT      NOT NULL PRIMARY KEY,
            identifier TEXT      NOT NULL,
            "value"    TEXT      NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NULL
        );

        -- add indexes
        CREATE INDEX IF NOT EXISTS idx_verifications_expires_at ON ${PUBLIC_SCHEMA}.verifications (expires_at);

        -- add triggers
        DROP TRIGGER IF EXISTS verification_set_update_timestamp ON ${PUBLIC_SCHEMA}.verifications;
        CREATE TRIGGER verification_set_update_timestamp
            BEFORE UPDATE
            ON ${PUBLIC_SCHEMA}.verifications
            FOR EACH ROW
        EXECUTE FUNCTION
            set_updated_timestamp();

        CREATE TABLE IF NOT EXISTS ${PUBLIC_SCHEMA}.jwks
        (
            id          TEXT      NOT NULL PRIMARY KEY,
            public_key  TEXT      NOT NULL,
            private_key TEXT      NOT NULL,
            created_at  TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_jwks_public_key ON ${PUBLIC_SCHEMA}.jwks (public_key);

        CREATE TABLE IF NOT EXISTS ${PUBLIC_SCHEMA}.two_factors
        (
            id           TEXT NOT NULL PRIMARY KEY,
            secret       TEXT NOT NULL,
            backup_codes TEXT NOT NULL,
            user_id      TEXT NOT NULL REFERENCES ${PUBLIC_SCHEMA}.users ("id")
        );

        CREATE INDEX IF NOT EXISTS idx_two_factors_user_id ON ${PUBLIC_SCHEMA}.two_factors (user_id);
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DROP TABLE IF EXISTS ${PUBLIC_SCHEMA}.two_factors;
        DROP TABLE IF EXISTS ${PUBLIC_SCHEMA}.jwks;
        DROP TABLE IF EXISTS ${PUBLIC_SCHEMA}.verifications;
        DROP TABLE IF EXISTS ${PUBLIC_SCHEMA}.accounts;
        DROP TABLE IF EXISTS ${PUBLIC_SCHEMA}.sessions;
        DROP TABLE IF EXISTS ${PUBLIC_SCHEMA}.users;
    `);
}
