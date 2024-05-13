import { afterAll, describe, expect, it } from 'vitest';

import { disconnectDatabase, server, testDataService } from '../../utils';
import { HttpStatusCode } from '../../../src/types/enums';

describe('Middlewares', () => {
    describe('Validate Authorization Header', () => {
        it('should return 401 when no token is passed', async () => {
            const response = await server.post('/api/auth/user/change-password').send({});

            expect(response.status).toEqual(HttpStatusCode.Unauthorized);
            expect(response.body.message).toBe('Please specify authorization header');
        });

        it('should return 401 with incorrect headers', async () => {
            const response = await server.post('/api/auth/user/change-password').send({}).set('Authorization', 'test');

            expect(response.status).toEqual(HttpStatusCode.Unauthorized);
            expect(response.body.message).toBe('Please specify correct authorization header');
        });

        it('should return 401 with unsupported headers', async () => {
            const response = await server
                .post('/api/auth/user/change-password')
                .send({})
                .set('Authorization', 'Bean test');

            expect(response.status).toEqual(HttpStatusCode.Unauthorized);
            expect(response.body.message).toBe('Please specify correct authorization header');
        });
    });

    describe('Validate Authenticated User', () => {
        it('should return 400 with expired token', async () => {
            const token = testDataService.issueExpiredToken();

            const response = await server
                .post('/api/auth/user/change-password')
                .send({})
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(HttpStatusCode.BadRequest);
            expect(response.body.message).toBe('Token expired');
        });

        it('should return 400 with bad token', async () => {
            const token = testDataService.issueBadToken();

            const response = await server
                .post('/api/auth/user/change-password')
                .send({})
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(HttpStatusCode.BadRequest);
            expect(response.body.message).toBe('Not authorized to access this route');
        });
    });

    afterAll(async () => {
        await disconnectDatabase();
    });
});
