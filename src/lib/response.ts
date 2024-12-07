import { Context } from 'hono';
import { HttpStatusCode } from '../types/enums';
import logger from '../log';

export const errorResponse = (
    context: Context,
    statusCode: HttpStatusCode,
    message: string,
    err?: Error,
    data?: any
) => {
    const response = { message, data };
    logger.info(context.get('requestId'), statusCode, { message });
    context.status(statusCode);

    return context.json(response);
};

export const serverErrorResponse = (context: Context, source: string, err: Error) => {
    logger.error(err, `[${source}] Internal Server Error`);

    const response = { message: 'Internal Server Error' };

    logger.info(context.get('requestId'), HttpStatusCode.InternalServerError, response);

    context.status(HttpStatusCode.InternalServerError);

    return context.json(response);
};

export const successResponse = (context: Context, statusCode: HttpStatusCode, message: string, data?: any) => {
    const response = { message, data };

    logger.info(context.get('requestId'), statusCode, { message });
    context.status(statusCode);

    return context.json(response);
};
