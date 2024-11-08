import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { faker } from '@faker-js/faker';

import { UserCreate, UserRepository } from '../../../src/types';
import { newUserRepository } from '../../../src/repositories';
import { DB, testDataService } from '../../utils';
import { AgeRange } from '../../../src/types/enums';

describe('User Repository', () => {
    let userRepository: UserRepository;

    beforeAll(async () => {
        userRepository = newUserRepository({ DB });
    });

    describe('Create User', () => {
        it('should create user', async () => {
            const data: UserCreate = {
                first_name: faker.person.firstName(),
                last_name: faker.person.firstName(),
                email: faker.internet.email(),
                password: faker.internet.password(),
                age_range: AgeRange.ADULT,
                avatar_url: faker.image.avatar(),
            };

            const result = await userRepository.create(data);

            expect(result).toMatchObject({
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                password: data.password,
                age_range: data.age_range,
                is_active: true,
                is_email_verified: false,
            });
        });
    });

    describe('List Users', () => {
        it('should list users', async () => {
            const { user } = await testDataService.createUser();

            const result = await userRepository.list({ id: user.id });

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        password: user.password,
                        age_range: user.age_range,
                        is_active: true,
                        is_email_verified: false,
                    }),
                ])
            );
        });

        it('should search for user', async () => {
            const { user } = await testDataService.createUser();

            const result = await userRepository.list({ search: user.email });

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        password: user.password,
                        age_range: user.age_range,
                        is_active: true,
                        is_email_verified: false,
                    }),
                ])
            );
        });
    });

    describe('Get User', () => {
        it('should get user', async () => {
            const age_range = AgeRange.CHILD;
            const first_name = faker.person.firstName();
            const last_name = faker.person.lastName();
            const email = faker.internet.email();

            const { user } = await testDataService.createUser({
                age_range,
                first_name,
                last_name,
                email,
            });

            const result = await userRepository.get({
                id: user.id,
                is_email_verified: false,
                is_active: true,
                age_range,
                first_name,
                last_name,
                email,
            });

            expect(result).toMatchObject({
                id: expect.any(Number),
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                password: user.password,
                age_range: user.age_range,
                is_active: true,
                is_email_verified: false,
            });
        });
    });

    describe('Update User', () => {
        it('should update user', async () => {
            const { user } = await testDataService.createUser();

            const result = await userRepository.update({ id: user.id }, { is_email_verified: true });

            expect(result).toMatchObject({
                id: expect.any(Number),
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                password: user.password,
                age_range: user.age_range,
                is_active: true,
                is_email_verified: true,
            });
        });
    });

    describe('Remove User', () => {
        it('should remove user', async () => {
            const { user } = await testDataService.createUser();

            // remove user
            await userRepository.remove({ id: user.id });

            const result = await userRepository.remove({ id: user.id });

            expect(result).toBeUndefined();
        });
    });

    afterAll(async () => {});
});
