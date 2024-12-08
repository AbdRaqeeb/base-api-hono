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
    if (err) logger.error(err);
    logger.info({ message, statusCode }, context.get('requestId'));

    context.status(statusCode);
    return context.json({ message, data });
};

export const serverErrorResponse = (context: Context, source: string, err: Error) => {
    const statusCode = HttpStatusCode.InternalServerError;
    const message = 'Internal Server Error';

    logger.error(err, `[${source}] Internal Server Error`);
    logger.info({ message, statusCode }, context.get('requestId'));

    context.status(HttpStatusCode.InternalServerError);
    return context.json({ message: 'Internal Server Error' });
};

export const successResponse = (context: Context, statusCode: HttpStatusCode, message: string, data?: any) => {
    logger.info({ message, statusCode }, context.get('requestId'));

    context.status(statusCode);
    return context.json({ message, data });
};
