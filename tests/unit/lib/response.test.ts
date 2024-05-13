import { describe, it, expect, vi } from 'vitest';

import Response from '../../utils/response';
import { errorResponse, serverErrorResponse, successResponse } from '../../../src/lib';
import { Response as ExpressResponse } from '../../../src/types';
import logger from '../../../src/log';
import { HttpStatusCode } from '../../../src/types/enums';

describe('Response Library', () => {
    describe('Error Response', () => {
        it('should send error response', () => {
            const response = new Response() as unknown as ExpressResponse;
            const statusCode = 400;
            const message = 'error message';

            const statusSpy = vi.spyOn(response, 'status');
            const jsonSpy = vi.spyOn(response, 'json');

            const logSpy = vi.spyOn(logger, 'response');

            errorResponse(response, statusCode, message);

            expect(statusSpy).toHaveBeenCalledWith(statusCode);
            expect(jsonSpy).toHaveBeenCalledWith({ message });
            expect(logSpy).toHaveBeenCalledWith(response.request_id, statusCode, { message });
        });
    });

    describe('Server Error Response', () => {
        it('should send server error response', () => {
            const response = new Response() as unknown as ExpressResponse;
            const context = 'Test';
            const error = new Error('test error');

            const statusSpy = vi.spyOn(response, 'status');
            const jsonSpy = vi.spyOn(response, 'json');

            const logResponseSpy = vi.spyOn(logger, 'response');
            const logErrorSpy = vi.spyOn(logger, 'error');

            serverErrorResponse(response, context, error);

            expect(statusSpy).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
            expect(jsonSpy).toHaveBeenCalledWith({ message: 'Internal Server Error' });
            expect(logErrorSpy).toHaveBeenCalledWith(error, `[${context}] Internal Server Error`);
            expect(logResponseSpy).toHaveBeenCalledWith(response.request_id, HttpStatusCode.InternalServerError, {
                message: 'Internal Server Error',
            });
        });
    });

    describe('Success Response', () => {
        it('should send success response', () => {
            const response = new Response() as unknown as ExpressResponse;
            const statusCode = 200;
            const message = 'User retrieved';
            const data = { user: 'John Doe' };

            const statusSpy = vi.spyOn(response, 'status');
            const jsonSpy = vi.spyOn(response, 'json');

            const logSpy = vi.spyOn(logger, 'response');

            successResponse(response, statusCode, message, data);

            expect(statusSpy).toHaveBeenCalledWith(statusCode);
            expect(jsonSpy).toHaveBeenCalledWith({ message, data });
            expect(logSpy).toHaveBeenCalledWith(response.request_id, statusCode, { message });
        });
    });
});
