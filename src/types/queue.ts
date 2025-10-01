import { Queue, QueueOptions, WorkerOptions } from 'bullmq';
import { EmailServiceSendPayload } from './email';

export interface QueueConfig {
    name: string;
    options: Partial<QueueOptions>;
}

export interface WorkerConfig {
    name: string;
    options: Partial<WorkerOptions>;
}

export interface QueueService {
    init(): void;
    stop(): Promise<void>;
    email: Queue<EmailServiceSendPayload<any>>;
}
