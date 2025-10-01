import { Context, Next } from 'hono';
import pino from 'pino';
import Config from '../config';
import project from '../project';
import { NODE_ENV } from '../types/enums';

let targets: pino.TransportTargetOptions[] = [];

if (Config.nodeEnv === NODE_ENV.DEVELOPMENT) {
    targets.push({
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'UTC:yyyy-mm-dd HH:MM:ss',
        },
    });
}

if (Config.nodeEnv === NODE_ENV.PRODUCTION) {
    targets = [
        {
            target: 'pino/file', // This will handle console output
            options: {
                destination: 1, // 1 -> stdout, 2 -> stderr
                messageKey: 'message',
            },
        },
        {
            target: './transports/betterstack',
            options: {
                endpoint: `https://${Config.liveTailIngestingHost}`,
                batchSize: 10,
                interval: 1000,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${Config.liveTailSourceToken}`,
                },
                messageKey: 'message',
            },
        },
    ];
}

/**
 Error Serializer to log error object
 as error object will not be logged normally
 */
const errorSerializer = {
    // Main serializer function
    serialize: (error: Error) => {
        // Handle non-error objects
        if (!(error instanceof Error)) {
            return error;
        }

        return {
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...error,
        };
    },
};

const transport = pino.transport({ targets });
const config: pino.LoggerOptions = {
    name: project.logName,
    redact: {
        paths: ['password', 'body.password', 'body.new_password'],
        censor: '[PINO REDACTED]',
    },
    level: process.env.LOG_LEVEL || 'info',
    serializers: {
        err: errorSerializer.serialize,
        error: errorSerializer.serialize,
    },
};

const logger = pino(config, transport);

export function logRequestMiddleware() {
    return function (context: Context, next: Next) {
        const requestId = context.get('requestId');

        logger.info(
            {
                route: context.req.path,
                url: context.req.url,
                body: context.get('body'),
                query: context.req.query(),
                params: context.req.param(),
                headers: context.req.header(),
                method: context.req.method,
            },
            requestId
        );
        return next();
    };
}

export default logger;
