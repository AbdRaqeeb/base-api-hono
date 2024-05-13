import { Knex } from 'knex';
import { RangeFilter, PaginationParam, PaginationResponse } from './custom';
import { AgeRange } from './enums';

export interface User {
    id: number;
    first_name?: string;
    last_name?: string;
    age_range?: AgeRange;
    email: string;
    avatar_url?: string;
    password?: string;
    is_email_confirmed: boolean;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface UserCreate {
    first_name?: string;
    last_name?: string;
    age_range?: AgeRange;
    email: string;
    password?: string;
    avatar_url?: string;
    is_email_confirmed?: boolean;
}

export type UserUpdate = Partial<UserCreate> & {
    is_email_confirmed?: boolean;
    is_active?: boolean;
};

export interface UserFilter extends RangeFilter, PaginationParam {
    id?: number;
    first_name?: string;
    last_name?: string;
    age_range?: AgeRange;
    email?: string;
    is_email_confirmed?: boolean;
    is_active?: boolean;
}

export interface UserRepository {
    create(data: UserCreate): Promise<User>;
    list(filter: UserFilter): Promise<User[]>;
    get(filter: UserFilter): Promise<User>;
    update(filter: UserFilter, data: UserUpdate): Promise<User>;
    remove(filter: UserFilter): Promise<void>;
    query(filter: UserFilter): Knex.QueryBuilder;
}

export type UserResponse = User & {
    has_password: boolean;
};

export type UserServiceOptions = {
    includePassword?: boolean;
};

export interface UserService {
    create(data: UserCreate): Promise<UserResponse>;
    list(data: UserFilter): Promise<PaginationResponse<UserResponse>>;
    get(data: UserFilter, options?: UserServiceOptions): Promise<UserResponse>;
    update(filter: UserFilter, data: UserUpdate): Promise<UserResponse>;
    remove(filter: UserFilter): Promise<void>;
}

export type UserCreateSchema = UserCreate;

export type UserUpdateSchema = Partial<Omit<UserCreate, 'email'>> & {
    avatar_url?: string;
    is_active?: boolean;
};

export type UserLoginSchema = {
    email: string;
    password: string;
};
