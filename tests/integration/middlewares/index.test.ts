import { describe, expect, it } from 'bun:test';

import { server, testDataService } from '../../utils';
import { HttpStatusCode } from '../../../src/types/enums';

describe('Middlewares', () => {
    describe('Validate Authorization Header', () => {
        it('should return 401 when no token is passed', async () => {
            const response = await server.post('/api/auth/user/change-password', {});
            expect(response.status).toEqual(HttpStatusCode.Unauthorized);

            const body = await response.json();
            expect(body.message).toBe('Please specify authorization header');
        });

        it('should return 401 with incorrect headers', async () => {
            const response = await server.post('/api/auth/user/change-password', {}, null, { Authorization: 'test' });
            expect(response.status).toEqual(HttpStatusCode.Unauthorized);

            const body = await response.json();
            expect(body.message).toBe('Please specify correct authorization header');
        });

        it('should return 401 with unsupported headers', async () => {
            const response = await server.post('/api/auth/user/change-password', {}, null, {
                Authorization: 'Bean test',
            });
            expect(response.status).toEqual(HttpStatusCode.Unauthorized);

            const body = await response.json();
            expect(body.message).toBe('Please specify correct authorization header');
        });
    });

    describe('Validate Authenticated User', () => {
        it('should return 400 with expired token', async () => {
            const token = testDataService.issueExpiredToken();

            const response = await server.post('/api/auth/user/change-password', {}, token);
            expect(response.status).toEqual(HttpStatusCode.BadRequest);

            const body = await response.json();
            expect(body.message).toBe('Token expired');
        });

        it('should return 400 with bad token', async () => {
            const token = testDataService.issueBadToken();

            const response = await server.post('/api/auth/user/change-password', {}, token);
            expect(response.status).toEqual(HttpStatusCode.BadRequest);

            const body = await response.json();
            expect(body.message).toBe('Not authorized to access this route');
        });
    });
});
