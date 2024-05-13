import { Response } from '../types';
import logger from '../log';
import { HttpStatusCode } from '../types/enums';

export const errorResponse = (res: Response, statusCode: number, message: string, err?: Error, data?: any) => {
    const response = { message, data };

    logger.response(res.request_id, statusCode, { message });
    return res.status(statusCode).json(response);
};

export const serverErrorResponse = (res: Response, context: string, err: Error) => {
    logger.error(err, `[${context}] Internal Server Error`);

    const response = { message: 'Internal Server Error' };

    logger.response(res.request_id, HttpStatusCode.InternalServerError, response);

    return res.status(HttpStatusCode.InternalServerError).json(response);
};

export const successResponse = (res: Response, statusCode: number, message: string, data?: any) => {
    const response = { message, data };

    logger.response(res.request_id, statusCode, { message });
    return res.status(statusCode).json(response);
};
