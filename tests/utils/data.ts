import { faker } from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';

import * as types from '../../src/types';
import * as enums from '../../src/types/enums';
import { OtpType, Role, UserModel } from '../../src/types/enums';
import { createRepositories } from '../../src/repositories';
import { DB } from './postgres';
import { PASSWORD_REGEX } from '../../src/constants';
import { passwordService, tokenService } from '../../src/lib';

export const repository = createRepositories(DB);

type DataOptions = {
    skipCreate?: boolean;
    omitPassword?: boolean;
};

function newTestData(rp: types.Repository) {
    async function createUser(
        payload?: Partial<types.UserCreate>,
        options?: DataOptions
    ): Promise<{ user: types.User; data: types.UserCreate; token: string }> {
        const data: types.UserCreate = {
            first_name: payload?.first_name || faker.person.firstName(),
            last_name: payload?.last_name || faker.person.firstName(),
            email: payload?.email || faker.internet.email(),
            password: payload?.password || faker.internet.password(),
            age_range: payload?.age_range || enums.AgeRange.ADULT,
            avatar_url: payload?.avatar_url || faker.image.avatar(),
            is_email_confirmed: payload?.is_email_confirmed || false,
        };

        // skip password
        if (options?.omitPassword) {
            delete data.password;
        }

        // hash password
        if (data.password) data.password = passwordService.hash(data.password);

        if (options?.skipCreate) {
            return { data, user: data as types.User, token: '' };
        }

        const user = await rp.user.create(data);
        const token = tokenService.issue({ id: user.id, role: UserModel.User });

        return { user, data, token };
    }

    function generatePassword() {
        const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let password = '';

        // Add at least one uppercase character
        password += upperCaseChars.charAt(Math.floor(Math.random() * upperCaseChars.length));

        // Add at least one lowercase character
        password += lowerCaseChars.charAt(Math.floor(Math.random() * lowerCaseChars.length));

        // Add at least one digit
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));

        // Add at least one special character
        password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));

        // Fill the rest of the password with random characters
        while (password.length < 8) {
            const charSet = upperCaseChars + lowerCaseChars + numbers + specialChars;
            password += charSet.charAt(Math.floor(Math.random() * charSet.length));
        }

        // Shuffle the password
        password = password
            .split('')
            .sort(() => Math.random() - 0.5)
            .join('');

        // If the generated password doesn't match the regex, recursively generate a new one
        if (!new RegExp(PASSWORD_REGEX).test(password)) {
            return generatePassword();
        }

        return password;
    }

    function issueExpiredToken(): string {
        // Create the JWT with an expired expiration time
        return jwt.sign({ id: 12345 }, process.env.JWT_SECRET, { expiresIn: '-10s' });
    }

    function issueBadToken(): string {
        // Create the JWT with an expired expiration time
        return jwt.sign({ id: 12345 }, 'test', { expiresIn: '5s' });
    }

    async function createOtp(payload?: Partial<types.OtpCreate>): Promise<{ data: types.OtpCreate; otp: types.Otp }> {
        const data: types.OtpCreate = {
            model: payload?.model || UserModel.Admin,
            model_id: payload?.model_id || faker.number.int({ min: 1, max: 100 }),
            type: payload?.type || OtpType.ResetPassword,
        };

        const otp = await rp.otp.create(data);

        return { data, otp };
    }

    async function createAdmin(
        payload?: Partial<types.AdminCreate>,
        options?: DataOptions
    ): Promise<{ admin: types.Admin; data: types.AdminCreate; token: string }> {
        const data: types.AdminCreate = {
            first_name: payload?.first_name || faker.person.firstName(),
            last_name: payload?.last_name || faker.person.firstName(),
            email: payload?.email || faker.internet.email(),
            password: payload?.password || faker.internet.password(),
            username: payload?.username || faker.internet.userName(),
            role: payload?.role || Role.Admin,
        };

        // skip password
        if (options?.omitPassword) {
            delete data.password;
        }

        // hash password
        if (data.password) data.password = passwordService.hash(data.password);

        if (options?.skipCreate) {
            return { data, admin: data as types.Admin, token: '' };
        }

        const admin = await rp.admin.create(data);
        const token = tokenService.issue({ id: admin.id, role: UserModel.Admin });

        return { admin, data, token };
    }

    return {
        createUser,
        generatePassword,
        issueBadToken,
        issueExpiredToken,
        createOtp,
        createAdmin,
    };
}

export const testDataService = newTestData(repository);
