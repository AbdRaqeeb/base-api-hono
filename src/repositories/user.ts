import { Knex } from 'knex';

import { User, UserCreate, UserFilter, UserRepository, UserUpdate } from '../types';
import { USERS } from '../database';
import * as lib from '../lib';
import { generateId } from '../lib';

interface UserStore {
    DB: Knex;
}

export function newUserRepository(us: UserStore): UserRepository {
    async function create(data: UserCreate): Promise<User> {
        const payload = { ...data, id: generateId() };
        const [result] = await us.DB(USERS).insert(payload).returning(lib.extractFieldNames(fields));
        return result;
    }

    async function get(filter: UserFilter): Promise<User> {
        return findUserBaseQuery(us.DB, filter).first(fields);
    }

    async function list(filter: UserFilter): Promise<User[]> {
        return findUserQuery(us.DB, filter);
    }

    async function remove(filter: UserFilter): Promise<void> {
        await us.DB(USERS).where(filter).del();
    }

    async function update(filter: UserFilter, data: UserUpdate): Promise<User> {
        const [result] = await us.DB(USERS).where(filter).update(data).returning(lib.extractFieldNames(fields));
        return result;
    }

    function query(filter: UserFilter): Knex.QueryBuilder {
        return findUserBaseQuery(us.DB, filter);
    }

    return { create, get, list, remove, update, query };
}

function findUserBaseQuery(db: Knex, filter: UserFilter): Knex.QueryBuilder {
    let query = db(`${USERS} as u`);

    if (filter.id) query.where('u.id', filter.id);
    if (filter.first_name) query.whereRaw(`LOWER(u.first_name) = ?`, [filter.first_name.toLowerCase()]);
    if (filter.last_name) query.whereRaw(`LOWER(u.last_name) = ?`, [filter.last_name.toLowerCase()]);
    if (filter.full_name) query.whereRaw(`LOWER(u.full_name) = ?`, [filter.full_name.toLowerCase()]);
    if (filter.email) query.whereRaw(`LOWER(u.email) = ?`, [filter.email.toLowerCase()]);
    if (filter.email_verified) query.where('u.email_verified', filter.email_verified);
    if (filter.search)
        query.where(function () {
            this.orWhereRaw('LOWER(u.first_name) LIKE ?', [`%${filter.search.toLowerCase()}%`])
                .orWhereRaw('LOWER(u.last_name) LIKE ?', [`%${filter.search.toLowerCase()}%`])
                .orWhereRaw('LOWER(u.email) LIKE ?', [`%${filter.search.toLowerCase()}%`])
                .orWhereRaw('LOWER(u.full_name) LIKE ?', [`%${filter.search.toLowerCase()}%`]);
        });

    // add range query
    query = lib.addRangeQuery(query, filter, 'u');

    return query;
}

function findUserQuery(db: Knex, filter: UserFilter): Knex.QueryBuilder {
    let query = findUserBaseQuery(db, filter).orderBy('u.created_at', 'desc');
    query = lib.addPaginationQuery(query, filter); // add pagination query
    query.select(fields);

    return query;
}

const fields = [
    'u.id as id',
    'u.first_name as first_name',
    'u.last_name as last_name',
    'u.full_name as full_name',
    'u.email as email',
    'u.email_verified as email_verified',
    'u.username as username',
    'u.image as image',
    'u.created_at as created_at',
    'u.updated_at as updated_at',
];
