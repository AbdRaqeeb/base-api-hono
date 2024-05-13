import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';

import { AdminService } from '../../../src/types';
import { disconnectDatabase } from '../../utils';
import { repository, testDataService } from '../../utils';
import { newAdminService } from '../../../src/services';
import { passwordService } from '../../../src/lib';
import { DEFAULT_SIZE } from '../../../src/constants';

describe('Admin Service', () => {
    let adminService: AdminService;

    beforeAll(() => {
        adminService = newAdminService(repository.admin, passwordService);
    });

    describe('Create Admin', () => {
        it('should create admin', async () => {
            const { data } = await testDataService.createAdmin({}, { skipCreate: true });

            const result = await adminService.add(data);

            expect(result).toMatchObject({
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                username: data.username,
                is_active: true,
                is_newly_created: true,
            });
            expect(result.password).toBeUndefined();
        });
    });

    describe('List Admins', () => {
        it('should list admins', async () => {
            const { admin } = await testDataService.createAdmin();

            const result = await adminService.list({ id: admin.id });

            expect(result.data[0]).toMatchObject({
                first_name: admin.first_name,
                last_name: admin.last_name,
                email: admin.email,
                username: admin.username,
                is_active: true,
                is_newly_created: true,
            });
            expect(result.pagination).toMatchObject({ size: DEFAULT_SIZE, current_page: expect.any(Number) });
        });
    });

    describe('Get Admin', () => {
        it('should get admin without password', async () => {
            const { admin } = await testDataService.createAdmin();

            const result = await adminService.get({ id: admin.id });

            expect(result).toMatchObject({
                first_name: admin.first_name,
                last_name: admin.last_name,
                email: admin.email,
                username: admin.username,
                is_active: true,
                is_newly_created: true,
            });
            expect(result.password).toBeUndefined();
        });

        it('should get admin with password', async () => {
            const { admin } = await testDataService.createAdmin();

            const result = await adminService.get({ id: admin.id }, { includePassword: true });

            expect(result).toMatchObject({
                first_name: admin.first_name,
                last_name: admin.last_name,
                email: admin.email,
                username: admin.username,
                is_active: true,
                is_newly_created: true,
                password: admin.password,
            });
        });
    });

    describe('Update Admin', () => {
        it('should update a admin', async () => {
            const newFirstName = faker.person.firstName();
            const { admin } = await testDataService.createAdmin();

            const result = await adminService.update({ id: admin.id }, { first_name: newFirstName });

            expect(result).toMatchObject({
                first_name: newFirstName,
                last_name: admin.last_name,
                email: admin.email,
                username: admin.username,
                is_active: true,
                is_newly_created: true,
            });
        });

        it('should hash admin password on update', async () => {
            const newPassword = faker.word.noun({ length: 10 });
            const { admin } = await testDataService.createAdmin();

            await adminService.update({ id: admin.id }, { password: newPassword });

            const result = await adminService.get({ id: admin.id }, { includePassword: true });

            expect(result.password).not.toBe(admin.password);
            expect(result.password).not.toBe(newPassword);
            expect(passwordService.valid(newPassword, result.password)).toBeTruthy();
        });
    });

    describe('Remove Admin', () => {
        it('should remove a admin', async () => {
            const { admin } = await testDataService.createAdmin();

            // delete admin
            await adminService.remove({ id: admin.id });

            const result = await adminService.get({ id: admin.id });

            expect(result).toBeUndefined();
        });
    });

    describe('Check Admin', () => {
        it('should check admin', async () => {
            const email = faker.internet.email();
            const username = faker.internet.userName();

            await testDataService.createAdmin({ username, email });

            const result = await adminService.check({ username, email });

            expect(result).toMatchObject({ id: expect.any(Number) });
        });

        it('should check non existing admin', async () => {
            const email = faker.internet.email();
            const username = faker.internet.userName();

            await testDataService.createAdmin();

            const result = await adminService.check({ username, email });

            expect(result).toBeUndefined();
        });
    });

    afterAll(async () => {
        await disconnectDatabase();
    });
});
