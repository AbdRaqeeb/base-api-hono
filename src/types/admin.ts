import { Knex } from 'knex';

import { Role } from './enums';
import { PaginationParam, PaginationResponse, RangeFilter } from './custom';

export interface Admin {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    password: string;
    is_active: boolean;
    role: Role;
    is_newly_created: boolean;
    created_at: Date;
    updated_at: Date;
}

export type AdminCreate = Omit<Admin, 'id' | 'is_active' | 'created_at' | 'updated_at' | 'is_newly_created'>;

export type AdminUpdate = Partial<Omit<AdminCreate, 'email' | 'username'>> & {
    is_newly_created?: boolean;
};

export interface AdminFilter extends RangeFilter, PaginationParam {
    id?: number;
    email?: string;
    username?: string;
    email_or_username?: string;
    is_active?: boolean;
    role?: Role;
    is_newly_created?: boolean;
}

export interface AdminCheck {
    email: string;
    username: string;
}

export interface AdminRepository {
    create: (data: AdminCreate) => Promise<Admin>;
    get: (filter: AdminFilter) => Promise<Admin>;
    list: (filter: AdminFilter) => Promise<Admin[]>;
    update: (filter: AdminFilter, data: AdminUpdate) => Promise<Admin>;
    remove: (filter: AdminFilter) => Promise<void>;
    check: (filter: AdminCheck) => Promise<{ id: number }>;
    query: (filter: AdminFilter) => Knex.QueryBuilder;
}

export type AdminResponse = Omit<Admin, 'password'> & {
    password?: string;
};

export type AdminServiceOptions = {
    includePassword?: boolean;
};

export interface AdminService {
    add: (data: AdminCreate) => Promise<AdminResponse>;
    get: (filter: AdminFilter, options?: AdminServiceOptions) => Promise<AdminResponse>;
    list: (filter: AdminFilter) => Promise<PaginationResponse<AdminResponse>>;
    update: (filter: AdminFilter, data: AdminUpdate) => Promise<AdminResponse>;
    remove: (filter: AdminFilter) => Promise<void>;
    check: (filter: AdminCheck) => Promise<{ id: number }>;
}

export interface AdminLoginSchema {
    email_or_username: string;
    password: string;
}

export interface AdminCreateSchema {
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
    role?: Role;
}

export interface AdminUpdateSchema {
    first_name?: string;
    last_name?: string;
}
