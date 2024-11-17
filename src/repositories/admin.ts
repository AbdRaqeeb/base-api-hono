import { Knex } from 'knex';

import { Admin, AdminCheck, AdminCreate, AdminFilter, AdminRepository, AdminUpdate } from '../types';
import { ADMINS } from '../database';
import * as lib from '../lib';

interface AdminStore {
    DB: Knex;
}

export function newAdminRepository(as: AdminStore): AdminRepository {
    async function create(data: AdminCreate): Promise<Admin> {
        const [result] = await as.DB(ADMINS).insert(data).returning(lib.extractFieldNames(fields));
        return result;
    }

    async function get(filter: AdminFilter): Promise<Admin> {
        return findAdminBaseQuery(as.DB, filter).first(fields);
    }

    async function remove(filter: AdminFilter): Promise<void> {
        await as.DB(ADMINS).where(filter).del();
    }

    async function update(filter: AdminFilter, data: AdminUpdate): Promise<Admin> {
        const [result] = await as.DB(ADMINS).where(filter).update(data).returning(lib.extractFieldNames(fields));
        return result;
    }

    async function list(filter: AdminFilter): Promise<Admin[]> {
        return findAdminQuery(as.DB, filter);
    }

    function query(filter: AdminFilter): Knex.QueryBuilder {
        return findAdminBaseQuery(as.DB, filter);
    }

    async function check(filter: AdminCheck): Promise<{ id: number }> {
        return as.DB(ADMINS).orWhere('email', filter.email).orWhere('username', filter.username).first('id');
    }

    return { create, get, remove, update, query, list, check };
}

function findAdminBaseQuery(db: Knex, filter: AdminFilter): Knex.QueryBuilder {
    let query = db(`${ADMINS} as a`);

    if (filter.id) query.where('a.id', filter.id);
    if (filter.email) query.whereRaw(`LOWER(a.email) = ?`, [filter.email.toLowerCase()]);
    if (filter.username) query.whereRaw(`LOWER(a.username) = ?`, [filter.username.toLowerCase()]);
    if (filter.is_active) query.where('a.is_active', filter.is_active);
    if (filter.is_newly_created) query.where('a.is_newly_created', filter.is_newly_created);
    if (filter.role) query.where('a.role', filter.role);

    if (filter.email_or_username)
        query.where(function () {
            this.orWhereRaw('LOWER(a.username) = ?', [filter.email_or_username.toLowerCase()]).orWhereRaw(
                'LOWER(a.email) = ?',
                [filter.email_or_username.toLowerCase()]
            );
        });

    if (filter.search)
        query.where(function () {
            this.orWhereRaw('LOWER(a.first_name) LIKE ?', [`%${filter.search.toLowerCase()}%`])
                .orWhereRaw('LOWER(a.last_name) LIKE ?', [`%${filter.search.toLowerCase()}%`])
                .orWhereRaw('LOWER(a.username) LIKE ?', [`%${filter.search.toLowerCase()}%`])
                .orWhereRaw('LOWER(a.email) LIKE ?', [`%${filter.search.toLowerCase()}%`]);
        });

    // add range query
    query = lib.addRangeQuery(query, filter, 'a');

    return query;
}

function findAdminQuery(db: Knex, filter: AdminFilter): Knex.QueryBuilder {
    let query = findAdminBaseQuery(db, filter).orderBy('a.created_at', 'desc');
    query = lib.addPaginationQuery(query, filter); // add pagination query
    query.select(fields);

    return query;
}

const fields = [
    'a.id as id',
    'a.first_name as first_name',
    'a.last_name as last_name',
    'a.email as email',
    'a.username as username',
    'a.password as password',
    'a.role as role',
    'a.is_active as is_active',
    'a.is_newly_created as is_newly_created',
    'a.created_at as created_at',
    'a.updated_at as updated_at',
];
