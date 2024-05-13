import { faker } from '@faker-js/faker';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { disconnectDatabase, repository, server, testDataService } from '../../utils';
import { AgeRange, HttpStatusCode, OtpType, UserModel } from '../../../src/types/enums';
import { passwordService } from '../../../src/lib';
import { brevoInstance as brevo } from '../../../src/services/email/brevo';

describe('User Endpoints', () => {
    beforeAll(() => {
        vi.spyOn(brevo, 'sendTransacEmail').mockImplementation(async () => {
            return {} as any;
        });
    });

    describe('Register', () => {
        it('should register a user', async () => {
            const data = {
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                email: faker.internet.email(),
                age_range: AgeRange.SENIOR,
                avatar_url: faker.image.avatar(),
                password: testDataService.generatePassword(),
            };

            const result = await server.post('/api/auth/user/register').send(data);

            expect(result.status).toEqual(HttpStatusCode.Created);
            expect(result.body.data).toHaveProperty('token');
            expect(result.body.data).toHaveProperty('user');
            expect(result.body.data).toHaveProperty('expiry');
        });

        it('should register a user with only email', async () => {
            const data = {
                email: faker.internet.email(),
            };

            const result = await server.post('/api/auth/user/register').send(data);

            expect(result.status).toEqual(HttpStatusCode.Created);
            expect(result.body).toMatchObject({ message: 'User registered' });
        });

        it('should fail validation', async () => {
            const data = {
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
            };

            const result = await server.post('/api/auth/user/register').send(data);

            expect(result.status).toEqual(HttpStatusCode.BadRequest);
            expect(result.body).toMatchObject({ message: 'email is required' });
        });

        it('should fail on existing user', async () => {
            const { user } = await testDataService.createUser();

            const data = { email: user.email };

            const result = await server.post('/api/auth/user/register').send(data);

            expect(result.status).toEqual(HttpStatusCode.BadRequest);
            expect(result.body).toMatchObject({ message: 'User exists already' });
        });
    });

    describe('Login', () => {
        it('should login user', async () => {
            const password = faker.internet.password();
            const { user } = await testDataService.createUser({ password });

            const data = { email: user.email, password };

            const result = await server.post('/api/auth/user/login').send(data);

            expect(result.status).toEqual(HttpStatusCode.Ok);
            expect(result.body.data).toMatchObject({
                user: { email: user.email, first_name: user.first_name, last_name: user.last_name },
                token: expect.any(String),
                expiry: expect.any(Number),
            });
        });

        it('should return set password for user without password', async () => {
            const password = faker.internet.password();
            const { user } = await testDataService.createUser({}, { omitPassword: true });

            const data = { email: user.email, password };

            const result = await server.post('/api/auth/user/login').send(data);

            expect(result.status).toEqual(HttpStatusCode.BadRequest);
            expect(result.body).toMatchObject({
                message: 'Set password to login',
            });
        });

        it('should return invalid email/password with wrong email', async () => {
            const data = {
                email: faker.internet.email(),
                password: testDataService.generatePassword(),
            };

            const result = await server.post('/api/auth/user/login').send(data);

            expect(result.status).toEqual(HttpStatusCode.BadRequest);
            expect(result.body).toMatchObject({
                message: 'Invalid email/password',
            });
        });

        it('should return invalid email/password with wrong password', async () => {
            const { user } = await testDataService.createUser();

            const data = {
                email: user.email,
                password: testDataService.generatePassword(),
            };

            const result = await server.post('/api/auth/user/login').send(data);

            expect(result.status).toEqual(HttpStatusCode.BadRequest);
            expect(result.body).toMatchObject({
                message: 'Invalid email/password',
            });
        });

        it('should fail with bad payload', async () => {
            const data = { email: faker.internet.email() };

            const result = await server.post('/api/auth/user/login').send(data);

            expect(result.status).toEqual(HttpStatusCode.BadRequest);
            expect(result.body).toMatchObject({
                message: 'password is required',
            });
        });
    });

    describe('Confirm Email', () => {
        it('should confirm email', async () => {
            const { user } = await testDataService.createUser();
            const { otp } = await testDataService.createOtp({
                model: UserModel.User,
                model_id: user.id,
                type: OtpType.ConfirmEmail,
            });

            const data = { code: otp.code };

            const response = await server.post('/api/auth/user/confirm-email').send(data);

            const confirmedUser = await repository.user.get({ id: user.id });
            const foundOtp = await repository.otp.get({
                code: otp.code,
                model: otp.model,
                model_id: otp.model_id,
                type: otp.type,
            });

            expect(response.status).toEqual(HttpStatusCode.Ok);
            expect(response.body).toMatchObject({ message: 'Email confirmed' });
            expect(foundOtp).toBeUndefined();
            expect(confirmedUser.is_email_confirmed).toBeTruthy();
        });

        it('should return 400 with bad payload', async () => {
            const data = {};

            const response = await server.post('/api/auth/user/confirm-email').send(data);

            expect(response.status).toEqual(HttpStatusCode.BadRequest);
            expect(response.body).toMatchObject({ message: 'code is required' });
        });

        it('should return 400 with invalid otp', async () => {
            const data = { code: faker.word.words() };

            const response = await server.post('/api/auth/user/confirm-email').send(data);

            expect(response.status).toEqual(HttpStatusCode.BadRequest);
            expect(response.body).toMatchObject({ message: 'Invalid otp' });
        });
    });

    describe('Forgot Password', () => {
        it('should forgot password', async () => {
            const { user } = await testDataService.createUser();

            const data = { email: user.email };

            const response = await server.post('/api/auth/user/forgot-password').send(data);

            expect(response.status).toEqual(HttpStatusCode.Ok);
            expect(response.body).toMatchObject({ message: 'Forgot password email sent' });
        });

        it('should return 400 with bad payload', async () => {
            const data = {};

            const response = await server.post('/api/auth/user/forgot-password').send(data);

            expect(response.status).toEqual(HttpStatusCode.BadRequest);
            expect(response.body).toMatchObject({ message: 'email is required' });
        });
    });

    describe('Reset Password', () => {
        it('should reset password', async () => {
            const { user } = await testDataService.createUser();
            const { otp } = await testDataService.createOtp({
                model: UserModel.User,
                model_id: user.id,
                type: OtpType.ResetPassword,
            });

            const data = {
                code: otp.code,
                password: testDataService.generatePassword(),
            };

            const response = await server.post('/api/auth/user/reset-password').send(data);

            const updatedUser = await repository.user.get({ email: user.email });
            const foundOtp = await repository.otp.get({
                code: otp.code,
                model: otp.model,
                model_id: otp.model_id,
                type: otp.type,
            });

            expect(response.status).toEqual(HttpStatusCode.Ok);
            expect(response.body).toMatchObject({ message: 'Password has been reset' });
            expect(foundOtp).toBeUndefined();
            expect(passwordService.valid(data.password, updatedUser.password)).toBeTruthy();
        });

        it('should return 400 with bad payload', async () => {
            const data = {};

            const response = await server.post('/api/auth/user/reset-password').send(data);

            expect(response.status).toEqual(HttpStatusCode.BadRequest);
            expect(response.body).toMatchObject({ message: 'code is required' });
        });

        it('should return 400 with invalid otp', async () => {
            const data = {
                code: faker.word.words(),
                password: testDataService.generatePassword(),
            };

            const response = await server.post('/api/auth/user/reset-password').send(data);

            expect(response.status).toEqual(HttpStatusCode.BadRequest);
            expect(response.body).toMatchObject({ message: 'Invalid / expired otp' });
        });

        it('should return 400 with invalid user', async () => {
            const { otp } = await testDataService.createOtp();

            const data = {
                code: otp.code,
                password: testDataService.generatePassword(),
            };

            const response = await server.post('/api/auth/user/reset-password').send(data);

            expect(response.status).toEqual(HttpStatusCode.BadRequest);
            expect(response.body).toMatchObject({ message: 'Invalid / expired otp' });
        });
    });

    describe('Set Account Password', () => {
        it('should set account password', async () => {
            const { user } = await testDataService.createUser();
            const { otp } = await testDataService.createOtp({
                model: UserModel.User,
                model_id: user.id,
                type: OtpType.SetPassword,
            });

            const data = {
                code: otp.code,
                password: testDataService.generatePassword(),
            };

            const response = await server.post('/api/auth/user/set-password').send(data);

            const updatedUser = await repository.user.get({ email: user.email, id: user.id });
            const foundOtp = await repository.otp.get({
                code: otp.code,
                model: otp.model,
                model_id: user.id,
                type: otp.type,
            });

            expect(response.status).toEqual(HttpStatusCode.Ok);
            expect(response.body).toMatchObject({ message: 'Account password set' });
            expect(foundOtp).toBeUndefined();
            expect(passwordService.valid(data.password, updatedUser.password)).toBeTruthy();
        });

        it('should return 400 with bad payload', async () => {
            const data = {};

            const response = await server.post('/api/auth/user/set-password').send(data);

            expect(response.status).toEqual(HttpStatusCode.BadRequest);
            expect(response.body).toMatchObject({ message: 'code is required' });
        });

        it('should return 400 with invalid otp', async () => {
            const data = {
                code: faker.word.words(),
                password: testDataService.generatePassword(),
            };

            const response = await server.post('/api/auth/user/set-password').send(data);

            expect(response.status).toEqual(HttpStatusCode.BadRequest);
            expect(response.body).toMatchObject({ message: 'Invalid / expired otp' });
        });

        it('should return 400 with invalid user', async () => {
            const { otp } = await testDataService.createOtp();

            const data = {
                code: otp.code,
                password: testDataService.generatePassword(),
            };

            const response = await server.post('/api/auth/user/set-password').send(data);

            expect(response.status).toEqual(HttpStatusCode.BadRequest);
            expect(response.body).toMatchObject({ message: 'Invalid / expired otp' });
        });
    });

    describe('Change Password', () => {
        it('should change password', async () => {
            const password = testDataService.generatePassword();
            const { user, token } = await testDataService.createUser({ password });

            const data = {
                password,
                new_password: testDataService.generatePassword(),
            };

            const response = await server
                .post('/api/auth/user/change-password')
                .send(data)
                .set('Authorization', `Bearer ${token}`);

            const updatedUser = await repository.user.get({ id: user.id });

            expect(response.status).toEqual(HttpStatusCode.Ok);
            expect(response.body).toMatchObject({ message: 'Password changed' });
            expect(passwordService.valid(data.new_password, updatedUser.password)).toBeTruthy();
            expect(passwordService.valid(data.password, updatedUser.password)).toBeFalsy();
        });

        it('should return 400 with bad payload', async () => {
            const { token } = await testDataService.createUser();

            const data = {};

            const response = await server
                .post('/api/auth/user/change-password')
                .send(data)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(HttpStatusCode.BadRequest);
            expect(response.body).toMatchObject({ message: 'password is required' });
        });

        it('should return 400 with invalid current password', async () => {
            const { token } = await testDataService.createUser();

            const data = {
                password: testDataService.generatePassword(),
                new_password: testDataService.generatePassword(),
            };

            const response = await server
                .post('/api/auth/user/change-password')
                .send(data)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(HttpStatusCode.BadRequest);
            expect(response.body).toMatchObject({ message: 'Invalid current password' });
        });
    });

    describe('Send Confirm Email Otp', () => {
        it('should send confirm email otp', async () => {
            const { token } = await testDataService.createUser();

            const response = await server
                .post('/api/auth/user/confirm-email-otp')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(HttpStatusCode.Ok);
            expect(response.body).toMatchObject({ message: 'Confirm email otp sent' });
        });

        it('should return user email is already confirmed', async () => {
            const { token } = await testDataService.createUser({ is_email_confirmed: true });

            const response = await server
                .post('/api/auth/user/confirm-email-otp')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(HttpStatusCode.BadRequest);
            expect(response.body).toMatchObject({ message: 'User email is confirmed' });
        });
    });

    afterAll(async () => {
        await disconnectDatabase();
    });
});
