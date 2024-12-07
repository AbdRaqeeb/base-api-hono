import { Resend } from 'resend';
import { EmailClientService, SendEmailParams } from '../../types';
import Config from '../../config';
import logger from '../../log';

const resend = new Resend(Config.resendApiKey);

export function resendService(): EmailClientService {
    async function send(params: SendEmailParams): Promise<void> {
        try {
            const to = (Array.isArray(params.to) ? params.to : [params.to]) as string | string[];

            await resend.emails.send({
                from: params.from as string,
                to,
                subject: params.subject,
                html: params.html,
                replyTo: params.reply_to as string,
                scheduledAt: params.send_at.toString(),
            });
        } catch (error) {
            logger.error(error, '[ResendService][Send] - error');
        }
    }

    return { send };
}

export { resend };
