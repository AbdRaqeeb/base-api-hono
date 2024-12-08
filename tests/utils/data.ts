import { faker } from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';

import { PASSWORD_REGEX } from '../../src/constants';
import { generateRandomString, tokenService } from '../../src/lib';
import { createRepositories } from '../../src/repositories';
import * as types from '../../src/types';
import { DB } from './postgres';

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
        const first_name = payload?.first_name || faker.person.firstName();
        const last_name = payload?.last_name || faker.person.lastName();
        const username =
            payload?.username ||
            faker.internet.userName({
                firstName: first_name,
                lastName: last_name,
            });
        const email =
            payload?.email ||
            faker.internet.email({
                firstName: first_name,
                lastName: last_name,
                provider: generateRandomString(),
                allowSpecialCharacters: true,
            });

        const data: types.UserCreate = {
            first_name,
            last_name,
            username,
            email,
            full_name: payload?.full_name || faker.person.fullName(),
            image: payload?.image || faker.image.avatar(),
            email_verified: payload?.email_verified || false,
        };

        if (options?.skipCreate) {
            return { data, user: data as types.User, token: '' };
        }

        const user = await rp.user.create(data);
        const token = tokenService.issue({ id: user.id });

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

    return {
        createUser,
        generatePassword,
        issueBadToken,
        issueExpiredToken,
    };
}

export const testDataService = newTestData(repository);
