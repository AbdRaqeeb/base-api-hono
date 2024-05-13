import bcrypt from 'bcryptjs';
import { SALT_VALUE } from '../constants';
import { PasswordService } from '../types';

function newPasswordService(): PasswordService {
    function valid(passwordToCompare: string, userPassword: string) {
        return bcrypt.compareSync(passwordToCompare, userPassword);
    }

    function hash(password: string): string {
        return bcrypt.hashSync(password, SALT_VALUE);
    }

    function generatePassword() {
        const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const specialCharacters = '!@#$%^&*()_+-={}|[]:;<>,.?/~';

        let password = '';

        // Ensure at least one uppercase letter
        password += uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)];

        // Ensure at least one lowercase letter
        password += lowercaseLetters[Math.floor(Math.random() * lowercaseLetters.length)];

        // Ensure at least one number
        password += numbers[Math.floor(Math.random() * numbers.length)];

        // Ensure at least one special character
        password += specialCharacters[Math.floor(Math.random() * specialCharacters.length)];

        // Fill the rest of the password with random characters
        while (password.length < 8) {
            const allCharacters = uppercaseLetters + lowercaseLetters + numbers + specialCharacters;
            password += allCharacters[Math.floor(Math.random() * allCharacters.length)];
        }

        // Shuffle the password to avoid the first characters always being in the same order
        password = password
            .split('')
            .sort(() => Math.random() - 0.5)
            .join('');

        return password;
    }

    return { hash, valid, generatePassword };
}

export const passwordService = newPasswordService();
