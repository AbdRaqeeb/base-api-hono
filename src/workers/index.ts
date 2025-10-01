import Redis from 'ioredis';
import { Worker } from 'bullmq';

import { AppWorker, EmailServiceSendPayload, Server, WorkerService } from '../types';
import { newEmailWorkerService } from './email';
import { workers } from '../constants';
import logger from '../log';

interface AppWorkerStore {
    server: Server;
}

export function newWorkerService(aws: AppWorkerStore): WorkerService {
    return {
        email: newEmailWorkerService(aws),
    };
}

interface WorkerStore {
    workerService: WorkerService;
    connection: Redis;
}

export function newAppWorker(ws: WorkerStore): AppWorker {
    let email: Worker<EmailServiceSendPayload<any>>;
    let workerNames: string[] = [];

    function init(): void {
        try {
            logger.info('[NewWorkerService][Init] Starting workers');

            email = new Worker(workers.email.name, ws.workerService.email.processor, {
                connection: ws.connection,
                ...workers.email.options,
            });
            handleWorkerEvents(email);

            workerNames = [email.name];

            logger.info(`[NewWorkerService][Init] The following workers started:\n - ${workerNames.join('\n - ')}`);
        } catch (error) {
            logger.error(error, '[NewWorkerService][Init]');
        }
    }

    async function stop(): Promise<void> {
        try {
            logger.info('[NewWorkerService][Stop] Stopping workers');

            await email.close();

            logger.info(`[NewWorkerService][Stop] The following workers stopped:\n - ${workerNames.join('\n - ')}`);
        } catch (error) {
            logger.error(error, '[NewWorkerService][Init]');
        }
    }

    return { init, stop, email };
}

function handleWorkerEvents(worker: Worker) {
    worker.on('progress', (job, progress) => {
        logger.info({ job_name: job.name, job_id: job.id, progress }, `[${worker.name} Worker Progress]`);
    });

    worker.on('error', (failedReason) => {
        logger.error(failedReason, `[${worker.name} Worker Error]`);
    });

    worker.on('failed', (job, error) => {
        logger.error(error, `[${worker.name} Worker Failed]`);
        logger.info({ job_name: job.name, job_id: job.id }, `[${worker.name} Failed Worker Detail]`);
    });

    worker.on('completed', (job) => {
        logger.info({ job_name: job.name, job_id: job.id }, `[${worker.name} Worker Job Completed]`);
    });
}
