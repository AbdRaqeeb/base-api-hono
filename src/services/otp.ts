import * as types from '../types';

export function newOtpService(or: types.OtpRepository): types.OtpService {
    async function add(data: types.OtpCreate): Promise<types.OtpCode> {
        const result = await or.create(data);

        return { code: result.code };
    }

    async function get(filter: types.OtpFilter): Promise<types.OtpResponse> {
        return or.get(filter);
    }

    async function remove(filter: types.OtpFilter): Promise<void> {
        await or.remove(filter);
    }

    return { add, get, remove };
}
