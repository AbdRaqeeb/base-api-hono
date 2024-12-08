CREATE TABLE IF NOT EXISTS "users"
(
    "id"             text      not null primary key,
    "full_name"      text      not null,
    "email"          text      not null unique,
    "email_verified" boolean   not null,
    "image"          text,
    "created_at"     timestamp not null,
    "updated_at"     timestamp not null,
    "first_name"     text,
    "last_name"      text
);

CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" (email);
CREATE INDEX IF NOT EXISTS "idx_users_email_verified" ON "users" (email_verified);

CREATE TABLE IF NOT EXISTS "sessions"
(
    "id"         text      not null primary key,
    "expires_at" timestamp not null,
    "token"      text      not null unique,
    "created_at" timestamp not null,
    "updated_at" timestamp not null,
    "ip_address" text,
    "user_agent" text,
    "user_id"    text      not null references "users" ("id")
);

CREATE INDEX IF NOT EXISTS "idx_sessions_token" ON "sessions" (token);
CREATE INDEX IF NOT EXISTS "idx_sessions_user_id" ON "sessions" (user_id);
CREATE INDEX IF NOT EXISTS "idx_sessions_expires_at" ON "sessions" (expires_at);

CREATE TABLE IF NOT EXISTS "accounts"
(
    "id"                      text      not null primary key,
    "account_id"              text      not null,
    "provider_id"             text      not null,
    "user_id"                 text      not null references "users" ("id"),
    "access_token"            text,
    "refresh_token"           text,
    "id_token"                text,
    "access_token_expires_at" timestamp,
    "scope"                   text,
    "password"                text,
    "created_at"              timestamp not null,
    "updated_at"              timestamp not null
);

CREATE INDEX IF NOT EXISTS "idx_accounts_provider_id" ON "accounts" (provider_id);
CREATE INDEX IF NOT EXISTS "idx_accounts_user_id" ON "accounts" (user_id);

CREATE TABLE IF NOT EXISTS "verifications"
(
    "id"         text      not null primary key,
    "identifier" text      not null,
    "value"      text      not null,
    "expires_at" timestamp not null,
    "created_at" timestamp,
    "updated_at" timestamp
);

CREATE INDEX IF NOT EXISTS "idx_verifications_expires_at" ON "verifications" (expires_at);
