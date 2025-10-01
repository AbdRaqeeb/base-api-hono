import { QueueConfig, WorkerConfig } from '../types';

export const QueueIds = {
    Email: {
        name: 'Email',
        prefix: 'email',
    },
} as const;

export const queues = {
    email: {
        name: QueueIds.Email.name,
        options: {
            prefix: QueueIds.Email.prefix,
            defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 50,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
            },
        },
    },
} as const satisfies Record<string, QueueConfig>;

export const WORKER_CONCURRENCY = 20;

export const workers = {
    email: {
        name: QueueIds.Email.name,
        options: {
            prefix: QueueIds.Email.prefix,
            removeOnComplete: { count: 1000 },
            removeOnFail: { count: 5000 },
            concurrency: WORKER_CONCURRENCY,
        },
    },
} as const satisfies Record<string, WorkerConfig>;
