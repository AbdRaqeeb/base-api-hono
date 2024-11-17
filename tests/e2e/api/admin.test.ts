import { faker } from '@faker-js/faker';
import { beforeAll, describe, expect, it, spyOn } from 'bun:test';

import { repository, server, testDataService } from '../../utils';
import { HttpStatusCode, OtpType, Role, UserModel } from '../../../src/types/enums';
import { passwordService } from '../../../src/lib';
import { sgMail as sendgrid } from '../../../src/services/email/sendgrid';
import { brevoInstance as brevo } from '../../../src/services/email/brevo';

describe('Admin Endpoints', () => {
    beforeAll(() => {
        spyOn(sendgrid, 'send').mockImplementation(async () => {
            return {} as any;
        });
        spyOn(brevo, 'sendTransacEmail').mockImplementation(async () => {
            return {} as any;
        });
    });

    describe('Add', () => {
        it('should add an admin', async () => {
            const { token } = await testDataService.createAdmin({ role: Role.SuperAdmin });

            const data = {
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                email: faker.internet.email(),
                username: faker.internet.userName(),
            };

            const result = await server.post('/api/auth/admin/new', data, token);
            expect(result.status).toEqual(HttpStatusCode.Created);

            const body = await result.json();
            expect(body).toMatchObject({ message: 'Admin added' });
        });

        it('should return 403 for role that is not super admin', async () => {
            const { token } = await testDataService.createAdmin({ role: Role.Admin });

            const data = {
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                email: faker.internet.email(),
                username: faker.internet.userName(),
            };

            const result = await server.post('/api/auth/admin/new', data, token);

            expect(result.status).toEqual(HttpStatusCode.Forbidden);
        });

        it('should fail validation', async () => {
            const { token } = await testDataService.createAdmin({ role: Role.SuperAdmin });

            const data = {
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
            };

            const result = await server.post('/api/auth/admin/new', data, token);
            expect(result.status).toEqual(HttpStatusCode.BadRequest);

            const body = await result.json();
            expect(body).toMatchObject({ message: 'email is required' });
        });

        it('should fail on existing admin email', async () => {
            const { admin, token } = await testDataService.createAdmin({ role: Role.SuperAdmin });

            const data = {
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                email: admin.email,
                username: faker.internet.userName(),
            };

            const result = await server.post('/api/auth/admin/new', data, token);
            expect(result.status).toEqual(HttpStatusCode.BadRequest);

            const body = await result.json();
            expect(body).toMatchObject({ message: 'Admin exists already' });
        });

        it('should fail on existing admin username', async () => {
            const { admin, token } = await testDataService.createAdmin({ role: Role.SuperAdmin });

            const data = {
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                email: faker.internet.email(),
                username: admin.username,
            };

            const result = await server.post('/api/auth/admin/new', data, token);
            expect(result.status).toEqual(HttpStatusCode.BadRequest);

            const body = await result.json();
            expect(body).toMatchObject({ message: 'Admin exists already' });
        });
    });

    describe('Login', () => {
        it('should login admin with email', async () => {
            const password = testDataService.generatePassword();
            const { admin } = await testDataService.createAdmin({ password });

            const data = { email_or_username: admin.email, password };

            const result = await server.post('/api/auth/admin/login', data);
            expect(result.status).toEqual(HttpStatusCode.Ok);

            const body = await result.json();
            expect(body.data).toMatchObject({
                admin: {
                    email: admin.email,
                    username: admin.username,
                    first_name: admin.first_name,
                    last_name: admin.last_name,
                },
                token: expect.any(String),
                expiry: expect.any(Number),
            });
        });

        it('should login admin with username', async () => {
            const password = testDataService.generatePassword();
            const { admin } = await testDataService.createAdmin({ password });

            const data = { email_or_username: admin.username, password };

            const result = await server.post('/api/auth/admin/login', data);
            expect(result.status).toEqual(HttpStatusCode.Ok);

            const body = await result.json();
            expect(body.data).toMatchObject({
                admin: {
                    email: admin.email,
                    username: admin.username,
                    first_name: admin.first_name,
                    last_name: admin.last_name,
                },
                token: expect.any(String),
                expiry: expect.any(Number),
            });
        });

        it('should return invalid email/password with wrong email', async () => {
            const data = {
                email_or_username: faker.internet.email(),
                password: testDataService.generatePassword(),
            };

            const result = await server.post('/api/auth/admin/login', data);
            expect(result.status).toEqual(HttpStatusCode.BadRequest);

            const body = await result.json();
            expect(body).toMatchObject({ message: 'Invalid email/password' });
        });

        it('should return invalid email/password with wrong username', async () => {
            const data = {
                email_or_username: faker.internet.userName(),
                password: testDataService.generatePassword(),
            };

            const result = await server.post('/api/auth/admin/login', data);
            expect(result.status).toEqual(HttpStatusCode.BadRequest);

            const body = await result.json();
            expect(body).toMatchObject({ message: 'Invalid email/password' });
        });

        it('should return invalid email/password with wrong password', async () => {
            const { admin } = await testDataService.createAdmin();

            const data = {
                email_or_username: admin.email,
                password: testDataService.generatePassword(),
            };

            const result = await server.post('/api/auth/admin/login', data);
            expect(result.status).toEqual(HttpStatusCode.BadRequest);

            const body = await result.json();
            expect(body).toMatchObject({ message: 'Invalid email/password' });
        });

        it('should fail with bad payload', async () => {
            const data = { email_or_username: faker.internet.email() };

            const result = await server.post('/api/auth/admin/login', data);
            expect(result.status).toEqual(HttpStatusCode.BadRequest);

            const body = await result.json();
            expect(body).toMatchObject({ message: 'password is required' });
        });
    });

    describe('Forgot Password', () => {
        it('should forgot password', async () => {
            const { admin } = await testDataService.createAdmin();

            const data = { email: admin.email };

            const response = await server.post('/api/auth/admin/forgot-password', data);
            expect(response.status).toEqual(HttpStatusCode.Ok);

            const body = await response.json();
            expect(body).toMatchObject({ message: 'Forgot password email sent' });
        });

        it('should return 400 with bad payload', async () => {
            const data = {};

            const response = await server.post('/api/auth/admin/forgot-password', data);
            expect(response.status).toEqual(HttpStatusCode.BadRequest);

            const body = await response.json();
            expect(body).toMatchObject({ message: 'email is required' });
        });
    });

    describe('Reset Password', () => {
        it('should reset password', async () => {
            const { admin } = await testDataService.createAdmin();
            const { otp } = await testDataService.createOtp({
                model: UserModel.Admin,
                model_id: admin.id,
                type: OtpType.ResetPassword,
            });

            const data = {
                code: otp.code,
                password: testDataService.generatePassword(),
            };

            const response = await server.post('/api/auth/admin/reset-password', data);

            const updatedAdmin = await repository.admin.get({ email: admin.email });
            const foundOtp = await repository.otp.get({
                code: otp.code,
                model: otp.model,
                model_id: otp.model_id,
                type: otp.type,
            });
            expect(response.status).toEqual(HttpStatusCode.Ok);

            const body = await response.json();
            expect(body).toMatchObject({ message: 'Password has been reset' });
            expect(foundOtp).toBeUndefined();
            expect(passwordService.valid(data.password, updatedAdmin.password)).toBeTruthy();
        });

        it('should return 400 with bad payload', async () => {
            const data = {};

            const response = await server.post('/api/auth/admin/reset-password', data);
            expect(response.status).toEqual(HttpStatusCode.BadRequest);

            const body = await response.json();
            expect(body).toMatchObject({ message: 'code is required' });
        });

        it('should return 400 with invalid otp', async () => {
            const data = {
                code: faker.word.words(),
                password: testDataService.generatePassword(),
            };

            const response = await server.post('/api/auth/admin/reset-password', data);
            expect(response.status).toEqual(HttpStatusCode.BadRequest);

            const body = await response.json();
            expect(body).toMatchObject({ message: 'Invalid / expired otp' });
        });

        it('should return 400 with invalid admin', async () => {
            const data = {
                code: faker.word.words(),
                password: testDataService.generatePassword(),
            };

            const response = await server.post('/api/auth/admin/reset-password', data);
            expect(response.status).toEqual(HttpStatusCode.BadRequest);

            const body = await response.json();
            expect(body).toMatchObject({ message: 'Invalid / expired otp' });
        });
    });

    describe('Change Password', () => {
        it('should change password', async () => {
            const password = testDataService.generatePassword();
            const { admin, token } = await testDataService.createAdmin({ password });

            const data = {
                password,
                new_password: testDataService.generatePassword(),
            };

            const response = await server.post('/api/auth/admin/change-password', data, token);

            const updatedAdmin = await repository.admin.get({ id: admin.id });

            expect(response.status).toEqual(HttpStatusCode.Ok);

            const body = await response.json();
            expect(body).toMatchObject({ message: 'Password changed' });
            expect(passwordService.valid(data.new_password, updatedAdmin.password)).toBeTruthy();
            expect(passwordService.valid(data.password, updatedAdmin.password)).toBeFalsy();
        });

        it('should return 400 with bad payload', async () => {
            const { token } = await testDataService.createAdmin();

            const data = {};

            const response = await server.post('/api/auth/admin/change-password', data, token);
            expect(response.status).toEqual(HttpStatusCode.BadRequest);

            const body = await response.json();
            expect(body).toMatchObject({ message: 'password is required' });
        });

        it('should return 400 with invalid current password', async () => {
            const { token } = await testDataService.createAdmin();

            const data = {
                password: testDataService.generatePassword(),
                new_password: testDataService.generatePassword(),
            };

            const response = await server.post('/api/auth/admin/change-password', data, token);
            expect(response.status).toEqual(HttpStatusCode.BadRequest);

            const body = await response.json();
            expect(body).toMatchObject({ message: 'Invalid current password' });
        });
    });
});
