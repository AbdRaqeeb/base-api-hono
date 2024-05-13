import './config';
import Server from './server';
import logger from './log';

Server.start();

process.on('uncaughtException', (err: Error) => {
    logger.fatal(err, '[UncaughtException]');
});

process.on('unhandledRejection', (err: Error) => {
    logger.fatal(err, '[UnhandledRejection]');
});
