import { Job } from 'bullmq';
import { EmailServiceSendPayload as EmailParams, EmailWorkerService, Server } from '../types';
import logger from '../log';
import { JobNames } from '../constants';

interface EmailWorkerStore {
    server: Server;
}

export function newEmailWorkerService(ews: EmailWorkerStore): EmailWorkerService {
    async function send(job: Job<EmailParams<any>>): Promise<void> {
        try {
            await job.updateProgress(`Sending ${job.data.emailType} email`);
            await ews.server.emailService.send(job.data);
            await job.updateProgress(`Finished sending ${job.data.emailType} email`);
        } catch (error) {
            logger.error(error, '[NewEmailWorkerService][Send]');
            throw error;
        }
    }

    async function processor(job: Job): Promise<void> {
        switch (job.name) {
            case JobNames.SendEmail:
                await send(job);
                break;
            default:
                logger.error(job.name, '[NewEmailWorkerService][Send]');
        }
    }

    return { send, processor };
}
