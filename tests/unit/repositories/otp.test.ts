import { beforeAll, describe, expect, it } from 'bun:test';
import { faker } from '@faker-js/faker';

import { OtpCreate, OtpRepository } from '../../../src/types';
import { newOtpRepository } from '../../../src/repositories';
import { DB, testDataService } from '../../utils';
import { OtpType, UserModel } from '../../../src/types/enums';

describe('Otp Repository', () => {
    let otpRepository: OtpRepository;

    beforeAll(() => {
        otpRepository = newOtpRepository({ DB });
    });

    describe('Create Otp', () => {
        it('should create otp', async () => {
            const data: OtpCreate = {
                model: UserModel.Admin,
                model_id: faker.number.int({ min: 1, max: 100 }),
                type: OtpType.SetPassword,
            };

            const result = await otpRepository.create(data);

            expect(result).toMatchObject({
                model: data.model,
                model_id: data.model_id,
                type: data.type,
            });
            expect(result.code).toBeDefined();
        });
    });

    describe('Get Otp', () => {
        it('should get otp', async () => {
            const { otp } = await testDataService.createOtp();

            const result = await otpRepository.get({
                model: otp.model,
                model_id: otp.model_id,
                type: otp.type,
                code: otp.code,
            });

            expect(result).toMatchObject({
                model: otp.model,
                model_id: otp.model_id,
                type: otp.type,
                code: otp.code,
            });
        });

        it('should return undefined', async () => {
            const { otp } = await testDataService.createOtp({ type: OtpType.ResetPassword });

            const result = await otpRepository.get({
                model: otp.model,
                model_id: otp.model_id,
                type: OtpType.VerifyEmail,
                code: faker.number.int({ min: 1, max: 100 }).toString(),
            });

            expect(result).toBeUndefined();
        });
    });

    describe('Remove Otp', () => {
        it('should remove otp', async () => {
            const { otp } = await testDataService.createOtp();

            const filter = {
                model: otp.model,
                model_id: otp.model_id,
                type: otp.type,
                code: otp.code,
            };

            // remove otp
            await otpRepository.remove(filter);

            const result = await otpRepository.get(filter);

            expect(result).toBeUndefined();
        });
    });
});
