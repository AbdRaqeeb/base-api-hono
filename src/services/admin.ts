import * as types from '../types';
import { paginate } from '../lib';
import { DEFAULT_SIZE } from '../constants';

export function newAdminService(ar: types.AdminRepository, ps: types.PasswordService): types.AdminService {
    async function add(data: types.AdminCreate): Promise<types.AdminResponse> {
        if (data.password) data.password = ps.hash(data.password);

        const result = await ar.create(data);
        const [admin] = formatAdmins([result]);

        return admin;
    }

    async function update(filter: types.AdminFilter, data: types.AdminUpdate): Promise<types.AdminResponse> {
        if (data.password) data.password = ps.hash(data.password);

        const result = await ar.update(filter, data);
        const [admin] = formatAdmins([result]);

        return admin;
    }

    async function remove(filter: types.AdminFilter): Promise<void> {
        await ar.remove(filter);
    }

    async function list(filter: types.AdminFilter): Promise<types.PaginationResponse<types.AdminResponse>> {
        if (!filter.size) filter.size = DEFAULT_SIZE.toString();

        const query = ar.query(filter);
        const result = await ar.list(filter);
        const admins = formatAdmins(result);

        return paginate(query, filter, admins);
    }

    async function get(filter: types.AdminFilter, options?: types.AdminServiceOptions): Promise<types.AdminResponse> {
        const result = await ar.get(filter);
        if (!result) return;

        const [admin] = formatAdmins([result], options);

        return admin;
    }

    async function check(filter: types.AdminCheck): Promise<{ id: number }> {
        return ar.check(filter);
    }

    return { add, update, remove, get, list, check };
}

function formatAdmins(admins: types.Admin[], options: types.AdminServiceOptions = {}): types.AdminResponse[] {
    const includePassword = options.includePassword ?? false;

    return admins.map((admin) => ({
        ...admin,
        ...(includePassword ? {} : { password: undefined }),
    }));
}
