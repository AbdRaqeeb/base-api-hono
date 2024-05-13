import { Knex } from 'knex';

import { Otp, OtpCreate, OtpFilter, OtpRepository } from '../types';
import { OTPS } from '../database';
import { generateOtp } from '../lib';

interface OtpStore {
    DB: Knex;
}

export function newOtpRepository(os: OtpStore): OtpRepository {
    async function create(data: OtpCreate): Promise<Otp> {
        const code = generateOtp();
        const [result] = await os.DB(OTPS).insert({ ...data, code }, '*');

        return result;
    }

    async function get(filter: OtpFilter): Promise<Otp> {
        const query = os
            .DB(OTPS)
            .where(function () {
                this.andWhere('type', filter.type)
                    .andWhere('code', filter.code)
                    .andWhere('model', filter.model)
                    .andWhere('expires_at', '>', os.DB.raw('NOW()'));
            })
            .first('*');

        if (filter.model_id) query.where('model_id', filter.model_id);

        return query;
    }

    async function remove(filter: OtpFilter): Promise<void> {
        await os.DB(OTPS).where(filter).del();
    }

    return { create, get, remove };
}
