import { beforeAll, describe, expect, it } from 'bun:test';
import { faker } from '@faker-js/faker';

import { UserService } from '../../../src/types';
import { repository, testDataService } from '../../utils';
import { newUserService } from '../../../src/services';
import { DEFAULT_SIZE } from '../../../src/constants';

describe('User Service', () => {
    let userService: UserService;

    beforeAll(() => {
        userService = newUserService(repository.user);
    });

    describe('Create User', () => {
        it('should create user', async () => {
            const { data } = await testDataService.createUser({}, { skipCreate: true });

            const result = await userService.create(data);

            expect(result).toMatchObject({
                first_name: data.first_name,
                last_name: data.last_name,
                full_name: data.full_name,
                email: data.email,
            });
        });
    });

    describe('List Users', () => {
        it('should list users', async () => {
            const { user } = await testDataService.createUser();

            const result = await userService.list({ id: user.id });

            expect(result.data[0]).toMatchObject({
                first_name: user.first_name,
                last_name: user.last_name,
                full_name: user.full_name,
                email: user.email,
            });
            expect(result.pagination).toMatchObject({
                size: DEFAULT_SIZE,
                current_page: expect.any(Number),
            });
        });
    });

    describe('Get User', () => {
        it('should get user', async () => {
            const { user } = await testDataService.createUser();

            const result = await userService.get({ id: user.id });

            expect(result).toMatchObject({
                first_name: user.first_name,
                last_name: user.last_name,
                full_name: user.full_name,
                email: user.email,
            });
        });
    });

    describe('Update User', () => {
        it('should update a user', async () => {
            const newFirstName = faker.person.firstName();
            const { user } = await testDataService.createUser();

            const result = await userService.update({ id: user.id }, { first_name: newFirstName });

            expect(result).toMatchObject({
                first_name: newFirstName,
                last_name: user.last_name,
                full_name: user.full_name,
                email: user.email,
            });
        });
    });

    describe('Remove User', () => {
        it('should remove a user', async () => {
            const { user } = await testDataService.createUser();

            // delete user
            await userService.remove({ id: user.id });

            const result = await userService.get({ id: user.id });

            expect(result).toBeUndefined();
        });
    });
});
