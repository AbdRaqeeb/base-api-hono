import { Knex } from 'knex';
import { PaginationParam, PaginationResponse, RangeFilter } from './custom';

export interface User {
    id: string;
    first_name?: string;
    last_name?: string;
    full_name: string;
    username: string;
    email: string;
    email_verified: boolean;
    image?: string;
    created_at: Date;
    updatedAt?: Date;
}

export interface UserCreate {
    id?: string;
    first_name?: string;
    last_name?: string;
    full_name: string;
    username: string;
    email: string;
    image?: string;
    email_verified?: boolean;
}

export type UserUpdate = Partial<UserCreate> & {
    email_verified?: boolean;
};

export interface UserFilter extends RangeFilter, PaginationParam {
    id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    email_verified?: boolean;
    full_name?: string;
}

export interface UserRepository {
    create(data: UserCreate): Promise<User>;
    list(filter: UserFilter): Promise<User[]>;
    get(filter: UserFilter): Promise<User>;
    update(filter: UserFilter, data: UserUpdate): Promise<User>;
    remove(filter: UserFilter): Promise<void>;
    query(filter: UserFilter): Knex.QueryBuilder;
}

export type UserResponse = User;

export interface UserService {
    create(data: UserCreate): Promise<UserResponse>;
    list(data: UserFilter): Promise<PaginationResponse<UserResponse>>;
    get(data: UserFilter): Promise<UserResponse>;
    update(filter: UserFilter, data: UserUpdate): Promise<UserResponse>;
    remove(filter: UserFilter): Promise<void>;
}
