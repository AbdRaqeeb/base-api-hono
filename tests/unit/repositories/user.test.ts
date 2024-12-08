import { beforeAll, describe, expect, it } from 'bun:test';
import { faker } from '@faker-js/faker';

import { newUserRepository } from '../../../src/repositories';
import { UserRepository } from '../../../src/types';
import { DB, testDataService } from '../../utils';

describe('User Repository', () => {
    let userRepository: UserRepository;

    beforeAll(async () => {
        userRepository = newUserRepository({ DB });
    });

    describe('Create User', () => {
        it('should create user', async () => {
            const { data } = await testDataService.createUser({}, { skipCreate: true });

            const result = await userRepository.create(data);

            expect(result).toMatchObject({
                first_name: data.first_name,
                last_name: data.last_name,
                full_name: data.full_name,
                email: data.email,
                email_verified: false,
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
                        first_name: user.first_name,
                        last_name: user.last_name,
                        full_name: user.full_name,
                        email: user.email,
                        email_verified: false,
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
                        first_name: user.first_name,
                        last_name: user.last_name,
                        full_name: user.full_name,
                        email: user.email,
                        email_verified: false,
                    }),
                ])
            );
        });
    });

    describe('Get User', () => {
        it('should get user', async () => {
            const first_name = faker.person.firstName();
            const last_name = faker.person.lastName();
            const email = faker.internet.email();

            const { user } = await testDataService.createUser({ first_name, last_name, email });

            const result = await userRepository.get({ id: user.id });

            expect(result).toMatchObject({
                first_name,
                last_name,
                full_name: user.full_name,
                email,
            });
        });
    });

    describe('Update User', () => {
        it('should update user', async () => {
            const { user } = await testDataService.createUser();

            const result = await userRepository.update({ id: user.id }, { email_verified: true });

            expect(result).toMatchObject({
                first_name: user.first_name,
                last_name: user.last_name,
                full_name: user.full_name,
                email: user.email,
                email_verified: true,
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
});
