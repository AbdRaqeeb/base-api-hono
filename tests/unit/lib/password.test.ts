import { describe, expect, it } from 'bun:test';
import { passwordService } from '../../../src/lib';

describe('Password Service', () => {
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
