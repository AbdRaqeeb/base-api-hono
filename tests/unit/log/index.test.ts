import { describe, expect, it, mock, spyOn } from 'bun:test';

import logger, { logRequestMiddleware, LogService } from '../../../src/log';
import { generateId } from '../../../src/lib';
import { HttpStatusCode } from '../../../src/types/enums';
import { Next } from '../../../src/types';
import { getContext } from '../../utils';

describe('Logger', () => {
    describe('Log Service', () => {
        it('should return the same instance', () => {
            const secondLogger = new LogService();

            expect(secondLogger).toBe(logger);
        });

        it('should log info', () => {
            const spy = spyOn(logger, 'info');

            logger.info({}, 'Info');

            expect(spy).toHaveBeenCalled();
        });

        it('should log fatal', () => {
            const spy = spyOn(logger, 'fatal');

            logger.fatal(new Error('test error'), 'Fatal');

            expect(spy).toHaveBeenCalled();
        });

        it('should log error', () => {
            const spy = spyOn(logger, 'error');

            logger.error(new Error('test error'), 'error');

            expect(spy).toHaveBeenCalled();
        });

        it('should log request', () => {
            const id = generateId();

            const spy = spyOn(logger, 'request');

            logger.request(id, { url: 'http://localhost:3000' });

            expect(spy).toHaveBeenCalled();
        });

        it('should log response', () => {
            const id = generateId();

            const spy = spyOn(logger, 'response');

            logger.response(id, HttpStatusCode.Ok, { message: 'Hello world' });

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('Log Request Middleware', () => {
        it('should log request using middleware', () => {
            const context = getContext();
            const next = mock() as Next;

            const logRequestSpy = spyOn(logger, 'request');

            logRequestMiddleware()(context, next);

            expect(logRequestSpy).toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });
    });
});
