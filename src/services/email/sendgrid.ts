import sgMail from '@sendgrid/mail';
import { EmailClientService, SendEmailParams } from '../../types';
import Config from '../../config';
import logger from '../../log';

sgMail.setApiKey(Config.sendGridApiKey);

export function sendgridService(): EmailClientService {
    async function send(params: SendEmailParams): Promise<void> {
        try {
            const to = Array.isArray(params.to) ? params.to : [params.to];

            await sgMail.send({
                from: params.from,
                to: to,
                subject: params.subject,
                html: params.html,
                replyTo: params.reply_to,
                sendAt: params.send_at,
            });
        } catch (error) {
            logger.error(error, '[SendgridService][Send] - error');
        }
    }

    return { send };
}

export { sgMail };
