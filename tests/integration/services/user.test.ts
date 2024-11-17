import { beforeAll, describe, expect, it } from 'bun:test';
import { faker } from '@faker-js/faker';

import { UserService } from '../../../src/types';
import { repository, testDataService } from '../../utils';
import { newUserService } from '../../../src/services';
import { passwordService } from '../../../src/lib';
import { DEFAULT_SIZE } from '../../../src/constants';

describe('User Service', () => {
    let userService: UserService;

    beforeAll(() => {
        userService = newUserService(repository.user, passwordService);
    });

    describe('Create User', () => {
        it('should create user', async () => {
            const { data } = await testDataService.createUser({}, { skipCreate: true });

            const result = await userService.create(data);

            expect(result).toMatchObject({
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                has_password: true,
                age_range: data.age_range,
                is_active: true,
                is_email_verified: false,
            });
            expect(result.password).toBeUndefined();
        });
    });

    describe('List Users', () => {
        it('should list users', async () => {
            const { user } = await testDataService.createUser();

            const result = await userService.list({ id: user.id });

            expect(result.data[0]).toMatchObject({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                has_password: true,
                age_range: user.age_range,
                is_active: true,
                is_email_verified: false,
            });
            expect(result.pagination).toMatchObject({
                size: DEFAULT_SIZE,
                current_page: expect.any(Number),
            });
        });
    });

    describe('Get User', () => {
        it('should get user without password', async () => {
            const { user } = await testDataService.createUser();

            const result = await userService.get({ id: user.id });

            expect(result).toMatchObject({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                has_password: true,
                age_range: user.age_range,
                is_active: true,
                is_email_verified: false,
            });
            expect(result.password).toBeUndefined();
        });

        it('should get user with password', async () => {
            const { user } = await testDataService.createUser();

            const result = await userService.get({ id: user.id }, { includePassword: true });

            expect(result).toMatchObject({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                has_password: true,
                age_range: user.age_range,
                is_active: true,
                is_email_verified: false,
                password: user.password,
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
                email: user.email,
                has_password: true,
                age_range: user.age_range,
                is_active: true,
                is_email_verified: false,
            });
        });

        it('should hash user password on update', async () => {
            const newPassword = faker.word.noun({ length: 10 });
            const { user } = await testDataService.createUser();

            await userService.update({ id: user.id }, { password: newPassword });

            const result = await userService.get({ id: user.id }, { includePassword: true });

            expect(result.password).not.toBe(user.password);
            expect(result.password).not.toBe(newPassword);
            expect(passwordService.valid(newPassword, result.password)).toBeTruthy();
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
