import { Job } from 'bullmq';
import { EmailServiceSendPayload as EmailParams } from '../email';

export interface EmailWorkerService {
    processor(email: Job): Promise<void>;
    send(email: Job<EmailParams<any>>): Promise<void>;
}
