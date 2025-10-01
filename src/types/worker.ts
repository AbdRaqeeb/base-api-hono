import { Worker } from 'bullmq';
import { EmailServiceSendPayload } from './email';
import { EmailWorkerService } from './workers/email';

export interface WorkerService {
    email: EmailWorkerService;
}

export interface AppWorker {
    init(): void;
    stop(): Promise<void>;
    email: Worker<EmailServiceSendPayload<any>>;
}
