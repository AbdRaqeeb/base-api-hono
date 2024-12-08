import { DEFAULT_SIZE } from '../constants';
import { paginate } from '../lib';
import * as types from '../types';

export function newUserService(us: types.UserRepository): types.UserService {
    async function create(data: types.UserCreate): Promise<types.UserResponse> {
        return us.create(data);
    }

    async function update(filter: types.UserFilter, data: types.UserUpdate): Promise<types.UserResponse> {
        return us.update(filter, data);
    }

    async function remove(filter: types.UserFilter): Promise<void> {
        await us.remove(filter);
    }

    async function list(filter: types.UserFilter): Promise<types.PaginationResponse<types.UserResponse>> {
        if (!filter.size) filter.size = DEFAULT_SIZE.toString();

        const query = us.query(filter);
        const users = await us.list(filter);

        return paginate(query, filter, users);
    }

    async function get(filter: types.UserFilter): Promise<types.UserResponse> {
        return us.get(filter);
    }

    return { create, update, get, list, remove };
}
