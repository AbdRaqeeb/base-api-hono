import { describe, expect, it } from 'bun:test';

import { passwordService, generateRandomString } from '../../../src/lib';

describe('Password Service', () => {
    describe('Hash', () => {
        it('should hash password', () => {
            const password = 'mySecretPassword';

            // Call the function to be tested
            const result = passwordService.hash(password);

            expect(result).not.toBe(password);
        });
    });

    describe('Valid', () => {
        it('should return false for invalid password', () => {
            const hashedPassword = passwordService.hash(generateRandomString());

            const result = passwordService.valid(generateRandomString(), hashedPassword);

            expect(result).toBeFalsy();
        });

        it('should return true for valid password', () => {
            const password = generateRandomString();

            const hashedPassword = passwordService.hash(password);

            const result = passwordService.valid(password, hashedPassword);

            expect(result).toBeTruthy();
        });
    });

    describe('Generate Password', () => {
        it('should generate a password with at least one uppercase letter', () => {
            const password = passwordService.generatePassword();
            expect(password).toMatch(/([A-Z])/);
        });

        it('should generate a password with at least one lowercase letter', () => {
            const password = passwordService.generatePassword();
            expect(password).toMatch(/([a-z])/);
        });

        it('should generate a password with at least one number', () => {
            const password = passwordService.generatePassword();
            expect(password).toMatch(/([0-9])/);
        });

        it('should generate a password with at least one special character', () => {
            const password = passwordService.generatePassword();
            expect(password).toMatch(/([!@#$%^&*()_+-={}\[\]:;<>,.?/~])/);
        });

        it('should generate a password with at least 8 characters', () => {
            const password = passwordService.generatePassword();
            expect(password.length).toBeGreaterThanOrEqual(8);
        });

        it('should not generate a password with whitespace characters', () => {
            const password = passwordService.generatePassword();
            expect(password).not.toMatch(/\s/);
        });
    });
});
