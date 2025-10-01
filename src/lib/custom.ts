import { createMiddleware } from 'hono/factory';
import { ObjectSchema } from 'joi';
import { Knex } from 'knex';
import { DateTime } from 'luxon';
import { customAlphabet } from 'nanoid';
import { rateLimiter, Store } from 'hono-rate-limiter';
import RedisStore from 'rate-limit-redis';

import { DEFAULT_SIZE } from '../constants';
import logger from '../log';
import {
    CalculatedPaginationData,
    Context,
    Next,
    PaginationParam,
    PaginationResponse,
    RangeFilter,
    UnknownObject,
} from '../types';
import Config from '../config';
import project from '../project';
import { redis } from '../database';

export function generateId(len = 15) {
    return customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', len)();
}

export function generateOtp() {
    return customAlphabet('1234567890', 6)();
}

export function generateRandomString(options: { length: number } = { length: 10 }) {
    return customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', options.length)();
}

export function getPaginationData(filter: PaginationParam): CalculatedPaginationData {
    const page = parseInt(filter.page, 10) || 1;
    const size = parseInt(filter.size, 10) || DEFAULT_SIZE;
    const startIndex = (page - 1) * size;
    const endIndex = page * size;

    return { page, size, startIndex, endIndex };
}

export function addPaginationQuery(query: Knex.QueryBuilder, filter: PaginationParam): Knex.QueryBuilder {
    const { startIndex, size } = getPaginationData(filter);

    query.offset(startIndex);

    query.limit(size);

    return query;
}

export async function paginate<T>(
    query: Knex.QueryBuilder,
    filter: PaginationParam,
    data: T[]
): Promise<PaginationResponse<T>> {
    const { endIndex, size, page, startIndex } = getPaginationData(filter);

    const result = await query.count({ total: '*' });

    const total = result[0]?.total || 0;

    const next = endIndex < total ? page + 1 : null;
    const previous = startIndex > 0 ? page - 1 : null;

    return {
        pagination: {
            total,
            size,
            current_page: page,
            next: next
                ? {
                      page: next,
                      size,
                  }
                : null,
            previous: previous
                ? {
                      page: previous,
                      size,
                  }
                : null,
        },
        data,
    };
}

export function validateSchema<T>(schema: ObjectSchema<T>, body: any, opts: any = {}): { error?: string; value?: T } {
    const { error, value } = schema.validate(body, {
        abortEarly: false,
        allowUnknown: opts.allowUnknown || false,
    });

    if (error) {
        let [
            {
                message: errorMessage,
                type: errorType,
                context: { key },
            },
        ] = error.details;

        if (errorType === 'any.required') errorMessage = `${key} is required`;

        if (errorType === 'string.pattern.base' && key === 'password') {
            errorMessage =
                'Password should be minimum of 8 characters, must contain at least 1 Uppercase letter, 1 lower case, 1 number and 1 special character';
        }

        if (errorType === 'string.pattern.base' && key === 'new_password') {
            errorMessage =
                'New password should be minimum of 8 characters, must contain at least 1 Uppercase letter, 1 lower case, 1 number and 1 special character';
        }

        if (errorType === 'object.unknown') {
            errorMessage = `Unknown/Unexpected parameter: '${error.details[0].context.key}'`;
        }

        return { error: errorMessage };
    }

    return { value };
}

export function stringify(data: UnknownObject, fields: string[]): UnknownObject {
    fields.forEach((field) => {
        if (data[field]) data[field] = JSON.stringify(data[field]);
    });

    return data;
}

export function addRangeQuery(query: Knex.QueryBuilder, filter: RangeFilter, alias: string): Knex.QueryBuilder {
    if (filter.from)
        query.where(`${alias}.created_at`, '>=', DateTime.fromISO(filter.from).toFormat('yyyy-MM-dd 00:00:00'));
    if (filter.to)
        query.where(`${alias}.created_at`, '<=', DateTime.fromISO(filter.to).toFormat('yyyy-MM-dd 00:00:00'));

    return query;
}

export const bodyParser = createMiddleware(async (context: Context, next: Next) => {
    // Only parse POST, PUT, PATCH requests
    const isAllowedMethod = ['POST', 'PUT', 'PATCH'].includes(context.req.method);
    const isJSON = context.req.header('content-type')?.includes('application/json');

    if (context.req.path.includes('/auth')) {
        await next();
        return;
    }

    if (!isAllowedMethod || !isJSON) {
        context.set('body', {});
        await next();
        return;
    }

    try {
        const body = await context.req.json();
        context.set('body', body);
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to parse JSON body');
        logger.error(err, '[BodyParser]');

        context.set('body', {});
    }

    await next();
});

export const setHeaders = createMiddleware(async (context: Context, next: Next) => {
    context.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE,OPTIONS');
    context.header('Access-Control-Allow-Headers', 'Accept, Content-Length, Content-Type, Authorization');
    await next();
});

export function extractFieldNames(fields: string[]): string[] {
    return fields.map((field) => {
        const parts = field.split(' as ');
        return parts[0].split('.').pop() || '';
    });
}

export const apiRateLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-6', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    keyGenerator: (c) => c.req.header('cf-connecting-ip') ?? generateId(), // Method to generate custom identifiers for clients.
    store: new RedisStore({
        // @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
        sendCommand: (...args: string[]) => redis.call(...args),
        prefix: `${Config.appStage}:${project.redisPrefix}:rate-limiter:`,
    }) as unknown as Store,
});
