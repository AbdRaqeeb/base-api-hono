import pino, { DestinationStream, Logger } from 'pino';
import { UnknownObject, Context, Next } from '../types';
import { LogLevels, NODE_ENV } from '../types/enums';
import Config from '../config';
import project from '../project';

const logTransport =
    Config.nodeEnv === NODE_ENV.PRODUCTION
        ? pino.transport({
              target: '@logtail/pino',
              options: { sourceToken: Config.liveTailSourceToken },
          })
        : pino.transport({
              target: 'pino-pretty',
              options: {
                  colorize: true,
                  translateTime: 'UTC:yyyy-mm-dd HH:MM:ss',
              },
          });

export class LogService {
    private static instance: LogService;
    private readonly logger: Logger;

    constructor(transport: DestinationStream = logTransport) {
        if (LogService.instance) {
            return LogService.instance;
        }

        this.logger = pino(
            {
                name: project.logName,
                redact: ['password', 'body.password', 'body.new_password'],
                level: Config.nodeEnv === NODE_ENV.TEST ? LogLevels.silent : LogLevels.info,
            },
            transport
        );

        LogService.instance = this;
    }

    info(data: UnknownObject, message?: string): void {
        this.logger.info(data, message);
    }

    error(err: Error, message?: string): void {
        this.logger.error(errorSerializer(err), message);
    }

    fatal(err: Error, message?: string): void {
        this.logger.fatal(err, message);
    }

    request(id: string, data: UnknownObject): void {
        this.logger.info({ id, ...data }, '[API Request]');
    }

    response(id: string, code: number, response: UnknownObject): void {
        this.logger.info({ id, code, ...response }, '[API Response]');
    }
}

const logger = new LogService();

export function logRequestMiddleware() {
    return function (context: Context, next: Next) {
        const requestId = context.get('requestId');

        logger.request(requestId, {
            route: context.req.path,
            url: context.req.url,
            body: context.req.json(),
            query: context.req.query(),
            params: context.req.param(),
            headers: context.req.header(),
            method: context.req.method,
        });
        return next();
    };
}

/**
 Error Serializer to log error object
 as error object will not be logged normally
 */
function errorSerializer(err: Error) {
    return {
        message: err.message,
        stack: err.stack,
        name: err.name,
        ...err,
    };
}

export default logger;
