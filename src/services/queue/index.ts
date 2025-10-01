import Redis from 'ioredis';
import { Queue } from 'bullmq';
import { QueueService } from '../../types';
import { queues } from '../../constants';
import logger from '../../log';
import { bullRedis } from '../../database';

interface QueueStore {
    connection: Redis;
}

export function newQueueService(qs: QueueStore): QueueService {
    function init(): void {
        try {
            const queueNames = [];
            logger.info('Initializing queue service...', '[NewQueueService][Init]');
            for (const queue of Object.values(queues)) {
                queueNames.push(queue.name);
                new Queue(queue.name, { ...queue.options, connection: qs.connection });
            }

            logger.info(`Initialized the following queues:\n - ${queueNames.join('\n - ')}`, '[NewQueueService][Init]');
        } catch (error) {
            logger.error(error, '[NewQueueService][Init] Error initializing queue service');
        }
    }

    async function stop(): Promise<void> {
        logger.info('[NewQueueService][Stop] Stopping all queue service...');
        for (const queue of Object.values(queues)) {
            try {
                const queueObject = new Queue(queue.name, { ...queue.options, connection: qs.connection });
                await queueObject.close();
            } catch (error) {
                logger.error(error, `[NewQueueService][Stop] Error closing ${queue.name} queue`);
            }
        }

        logger.info('[NewQueueService][Stop] Stopping all queue service done...');
    }

    const email = new Queue(queues.email.name, {
        ...queues.email.options,
        connection: qs.connection,
    });

    return { init, stop, email };
}

export const queue = newQueueService({ connection: bullRedis });
