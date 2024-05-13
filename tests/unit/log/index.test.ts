import { afterEach, describe, expect, it, vi } from 'vitest';

import logger, { logRequestMiddleware, LogService } from '../../../src/log';
import { generateId } from '../../../src/lib';
import { HttpStatusCode } from '../../../src/types/enums';
import Response from '../../utils/response';
import { NextFunction, Request as ExpressRequest, Response as ExpressResponse } from '../../../src/types';

describe('Logger', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Log Service', () => {
        it('should return the same instance', () => {
            const secondLogger = new LogService();

            expect(secondLogger).toBe(logger);
        });

        it('should log info', () => {
            const spy = vi.spyOn(logger, 'info');

            logger.info({}, 'Info');

            expect(spy).toHaveBeenCalled();
        });

        it('should log fatal', () => {
            const spy = vi.spyOn(logger, 'fatal');

            logger.fatal(new Error('test error'), 'Fatal');

            expect(spy).toHaveBeenCalled();
        });

        it('should log error', () => {
            const spy = vi.spyOn(logger, 'error');

            logger.error(new Error('test error'), 'error');

            expect(spy).toHaveBeenCalled();
        });

        it('should log request', () => {
            const id = generateId();

            const spy = vi.spyOn(logger, 'request');

            logger.request(id, { url: 'http://localhost:3000' });

            expect(spy).toHaveBeenCalled();
        });

        it('should log response', () => {
            const id = generateId();

            const spy = vi.spyOn(logger, 'response');

            logger.response(id, HttpStatusCode.Ok, { message: 'Hello world' });

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('Log Request Middleware', () => {
        it('should log request using middleware', () => {
            const response = new Response() as unknown as ExpressResponse;
            const request = {
                route: 'test',
                url: '/test',
                query: {},
                params: {},
                headers: {},
            } as ExpressRequest;
            const next = vi.fn() as NextFunction;

            const logRequestSpy = vi.spyOn(logger, 'request');

            logRequestMiddleware()(request, response, next);

            expect(logRequestSpy).toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });
    });
});
