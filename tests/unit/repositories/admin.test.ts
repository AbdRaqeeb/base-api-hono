import { beforeAll, describe, expect, it } from 'bun:test';
import { faker } from '@faker-js/faker';

import { AdminCreate, AdminRepository } from '../../../src/types';
import { newAdminRepository } from '../../../src/repositories';
import { DB, testDataService } from '../../utils';
import { Role } from '../../../src/types/enums';

describe('Admin Repository', () => {
    let adminRepository: AdminRepository;

    beforeAll(() => {
        adminRepository = newAdminRepository({ DB });
    });

    describe('Create Admin', () => {
        it('should create admin', async () => {
            const data: AdminCreate = {
                first_name: faker.person.firstName(),
                last_name: faker.person.firstName(),
                email: faker.internet.email(),
                password: faker.internet.password(),
                username: faker.internet.userName(),
                role: Role.SuperAdmin,
            };

            const result = await adminRepository.create(data);

            expect(result).toMatchObject({
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                password: data.password,
                username: data.username,
                is_active: true,
                role: data.role,
                is_newly_created: true,
            });
        });
    });

    describe('List Admins', () => {
        it('should list admins', async () => {
            const { admin } = await testDataService.createAdmin();

            const result = await adminRepository.list({ id: admin.id });

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        first_name: admin.first_name,
                        last_name: admin.last_name,
                        email: admin.email,
                        password: admin.password,
                        username: admin.username,
                        is_active: true,
                        role: admin.role,
                        is_newly_created: true,
                    }),
                ])
            );
        });

        it('should search for admin', async () => {
            const { admin } = await testDataService.createAdmin();

            const result = await adminRepository.list({ search: admin.username });

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        first_name: admin.first_name,
                        last_name: admin.last_name,
                        email: admin.email,
                        password: admin.password,
                        username: admin.username,
                        is_active: true,
                        role: admin.role,
                        is_newly_created: true,
                    }),
                ])
            );
        });
    });

    describe('Get Admin', () => {
        it('should get admin', async () => {
            const email = faker.internet.email();
            const username = faker.internet.userName();

            const { admin } = await testDataService.createAdmin({ username, email });

            const result = await adminRepository.get({
                id: admin.id,
                is_active: true,
                username,
                email,
            });

            expect(result).toMatchObject({
                id: expect.any(Number),
                first_name: admin.first_name,
                last_name: admin.last_name,
                email: admin.email,
                password: admin.password,
                username,
                role: admin.role,
                is_newly_created: true,
            });
        });
    });

    describe('Check Admin', () => {
        it('should check admin', async () => {
            const email = faker.internet.email();
            const username = faker.internet.userName();

            await testDataService.createAdmin({ username, email });

            const result = await adminRepository.check({ username, email });

            expect(result).toMatchObject({ id: expect.any(Number) });
        });

        it('should check non existing admin', async () => {
            const email = faker.internet.email();
            const username = faker.internet.userName();

            await testDataService.createAdmin();

            const result = await adminRepository.check({ username, email });

            expect(result).toBeUndefined();
        });
    });

    describe('Update Admin', () => {
        it('should update admin', async () => {
            const { admin } = await testDataService.createAdmin();

            const result = await adminRepository.update({ id: admin.id }, { is_newly_created: false });

            expect(result).toMatchObject({
                id: expect.any(Number),
                first_name: admin.first_name,
                last_name: admin.last_name,
                email: admin.email,
                password: admin.password,
                username: admin.username,
                is_active: true,
                role: admin.role,
                is_newly_created: false,
            });
        });
    });

    describe('Remove Admin', () => {
        it('should remove admin', async () => {
            const { admin } = await testDataService.createAdmin();

            // remove admin
            await adminRepository.remove({ id: admin.id });

            const result = await adminRepository.remove({ id: admin.id });

            expect(result).toBeUndefined();
        });
    });
});
