import { describe, it, expect, spyOn } from 'bun:test';

import { getContext } from '../../utils';
import { errorResponse, serverErrorResponse, successResponse } from '../../../src/lib';
import logger from '../../../src/log';
import { HttpStatusCode } from '../../../src/types/enums';

describe('Response Library', () => {
    describe('Error Response', () => {
        it('should send error response', () => {
            const context = getContext();
            const statusCode = 400;
            const message = 'error message';

            const statusSpy = spyOn(context, 'status');
            const jsonSpy = spyOn(context, 'json');

            const logSpy = spyOn(logger, 'response');

            errorResponse(context, statusCode, message);

            expect(statusSpy).toHaveBeenCalledWith(statusCode);
            expect(jsonSpy).toHaveBeenCalledWith({ message });
            expect(logSpy).toHaveBeenCalledWith(context.get('requestId'), statusCode, { message });
        });
    });

    describe('Server Error Response', () => {
        it('should send server error response', () => {
            const context = getContext();
            const source = 'Test';
            const error = new Error('test error');

            const statusSpy = spyOn(context, 'status');
            const jsonSpy = spyOn(context, 'json');

            const logResponseSpy = spyOn(logger, 'response');
            const logErrorSpy = spyOn(logger, 'error');

            serverErrorResponse(context, source, error);

            expect(statusSpy).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
            expect(jsonSpy).toHaveBeenCalledWith({ message: 'Internal Server Error' });
            expect(logErrorSpy).toHaveBeenCalledWith(error, `[${source}] Internal Server Error`);
            expect(logResponseSpy).toHaveBeenCalledWith(context.get('requestId'), HttpStatusCode.InternalServerError, {
                message: 'Internal Server Error',
            });
        });
    });

    describe('Success Response', () => {
        it('should send success response', () => {
            const context = getContext();
            const statusCode = 200;
            const message = 'User retrieved';
            const data = { user: 'John Doe' };

            const statusSpy = spyOn(context, 'status');
            const jsonSpy = spyOn(context, 'json');

            const logSpy = spyOn(logger, 'response');

            successResponse(context, statusCode, message, data);

            expect(statusSpy).toHaveBeenCalledWith(statusCode);
            expect(jsonSpy).toHaveBeenCalledWith({ message, data });
            expect(logSpy).toHaveBeenCalledWith(context.get('requestId'), statusCode, { message });
        });
    });
});
