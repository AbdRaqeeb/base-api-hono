import './config';
import logger from './log';
import { DateTime } from 'luxon';
import { createNewServer } from './api';
import Config from './config';
import project from './project';

export default {
    port: Config.port,
    fetch: createNewServer().app.fetch,
};

if (Config.nodeEnv === 'development') {
    logger.info({}, `${project.name} server is LIVE ⚡️🔥 at port ${Config.port}`);
}

process.on('uncaughtException', (err: Error) => {
    logger.fatal(err, '[UncaughtException] - Shutting down server...');
    process.exit(1);
});

process.on('unhandledRejection', (err: Error) => {
    logger.fatal(err, '[UnhandledRejection] - Shutting down server...');
    process.exit(1);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
    logger.info({ time: DateTime.now().toISO() }, '[SIGTERM] Signal received, shutting down...');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info({ time: DateTime.now().toISO() }, '[SIGINT] Signal received, shutting down...');
    process.exit(0);
});
