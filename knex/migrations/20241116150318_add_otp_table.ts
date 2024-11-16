import type { Knex } from 'knex';
import { ACCOUNT_SCHEMA } from '../schemas';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS ${ACCOUNT_SCHEMA}.otps (
            id          SERIAL PRIMARY KEY,
            code        VARCHAR(255)                    NOT NULL,
            "type"      VARCHAR(255)                    NOT NULL,
            model       VARCHAR(20)                     NOT NULL,
            model_id    INTEGER                         NOT NULL,
            expires_at  TIMESTAMP WITHOUT TIME ZONE     NOT NULL DEFAULT NOW() + INTERVAL '1 hour',
            created_at  TIMESTAMP WITHOUT TIME ZONE     NOT NULL DEFAULT NOW()
        );
    `);

    // add indexes
    await knex.raw(`
        CREATE INDEX IF NOT EXISTS otp_code_idx ON ${ACCOUNT_SCHEMA}.otps (code);
        CREATE INDEX IF NOT EXISTS otp_model_idx ON ${ACCOUNT_SCHEMA}.otps (model);
        CREATE INDEX IF NOT EXISTS otp_model_id_idx ON ${ACCOUNT_SCHEMA}.otps (model_id);
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`DROP TABLE IF EXISTS ${ACCOUNT_SCHEMA}.otps;`);
}
