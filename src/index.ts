import './config';
import { createApplication } from './app';
import Config from './config';
import logger from './log';
import project from './project';

const { server, worker } = createApplication();

export default {
    port: Config.port,
    fetch: server.app.fetch,
};

if (Config.nodeEnv === 'development') {
    logger.info(`${project.name} server is LIVE ⚡️🔥 at port ${Config.port}`);
}

server.queue.init();
worker.init();

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
    logger.info('[SIGTERM] SIGTERM signal received, shutting down...');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('[SIGINT] SIGINT signal received, shutting down...');
    process.exit(0);
});
