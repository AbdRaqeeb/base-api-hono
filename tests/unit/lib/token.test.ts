import { describe, expect, it } from 'bun:test';

import { tokenService } from '../../../src/lib';

describe('Token Service', () => {
    describe('Issue', () => {
        it('should issue token', () => {
            const payload = { id: '123' };

            const token = tokenService.issue(payload);

            expect(token).toBeDefined();
        });
    });

    describe('Verify', () => {
        it('should verify token', () => {
            const payload = { id: '123' };
            const token = tokenService.issue(payload);

            const result = tokenService.verify(token);

            expect(result.id).toEqual(payload.id);
        });
    });

    describe('Expiry', () => {
        it('should return expiry', () => {
            const payload = { id: '123' };
            const token = tokenService.issue(payload);

            const result = tokenService.expiry(token);

            const currentTime = Date.now() / 1000;

            expect(result).toBeGreaterThan(currentTime);
        });
    });
});
