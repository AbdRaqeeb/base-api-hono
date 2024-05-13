import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';

import { OtpCreate, OtpService } from '../../../src/types';
import { disconnectDatabase, repository, testDataService } from '../../utils';
import { OtpType, UserModel } from '../../../src/types/enums';
import { newOtpService } from '../../../src/services';

describe('Otp Service', () => {
    let otpService: OtpService;

    beforeAll(() => {
        otpService = newOtpService(repository.otp);
    });

    describe('Create Otp', () => {
        it('should create otp', async () => {
            const data: OtpCreate = {
                model: UserModel.Admin,
                model_id: faker.number.int({ min: 1, max: 100 }),
                type: OtpType.SetPassword,
            };

            const result = await otpService.add(data);

            expect(result.code).toBeDefined();
        });
    });

    describe('Get Otp', () => {
        it('should get otp', async () => {
            const { otp } = await testDataService.createOtp();

            const result = await otpService.get({
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

            const result = await otpService.get({
                model: otp.model,
                model_id: otp.model_id,
                type: OtpType.ConfirmEmail,
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
            await otpService.remove(filter);

            const result = await otpService.get(filter);

            expect(result).toBeUndefined();
        });
    });

    afterAll(async () => {
        await disconnectDatabase();
    });
});
