create table "jwks"
(
    "id"         text      not null primary key,
    "publicKey"  text      not null,
    "privateKey" text      not null,
    "createdAt"  timestamp not null
);