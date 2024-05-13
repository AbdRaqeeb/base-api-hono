import * as types from '../types';
import { paginate } from '../lib';
import { DEFAULT_SIZE } from '../constants';

export function newUserService(us: types.UserRepository, ps: types.PasswordService): types.UserService {
    async function create(data: types.UserCreate): Promise<types.UserResponse> {
        if (data.password) data.password = ps.hash(data.password);

        const result = await us.create(data);
        const [user] = formatUsers([result]);

        return user;
    }

    async function update(filter: types.UserFilter, data: types.UserUpdate): Promise<types.UserResponse> {
        if (data.password) data.password = ps.hash(data.password);

        const result = await us.update(filter, data);
        const [user] = formatUsers([result]);

        return user;
    }

    async function remove(filter: types.UserFilter): Promise<void> {
        await us.remove(filter);
    }

    async function list(filter: types.UserFilter): Promise<types.PaginationResponse<types.UserResponse>> {
        if (!filter.size) filter.size = DEFAULT_SIZE.toString();

        const query = us.query(filter);
        const result = await us.list(filter);
        const users = formatUsers(result);

        return paginate(query, filter, users);
    }

    async function get(filter: types.UserFilter, options?: types.UserServiceOptions): Promise<types.UserResponse> {
        const result = await us.get(filter);
        if (!result) return;

        const [user] = formatUsers([result], options);

        return user;
    }

    return { create, update, get, list, remove };
}

function formatUsers(users: types.User[], options: types.UserServiceOptions = {}): types.UserResponse[] {
    const includePassword = options.includePassword ?? false;

    return users.map((user) => ({
        ...user,
        has_password: !!user.password,
        ...(includePassword ? {} : { password: undefined }),
    }));
}
