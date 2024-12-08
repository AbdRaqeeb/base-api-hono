import Config from '../../config';
import { request } from '../../lib';
import logger from '../../log';
import { EmailClientService, EmailUser, SendEmailParams } from '../../types';

export function sendgridService(): EmailClientService {
    async function send(params: SendEmailParams): Promise<void> {
        try {
            await request.post('https://api.sendgrid.com/v3/mail/send', formatPayload(params), {
                headers: {
                    Authorization: `Bearer ${Config.sendGridApiKey}`,
                },
            });
        } catch (error) {
            logger.error(error, '[SendgridService][Send] - error');
        }
    }

    return { send };
}

function formatPayload(params: SendEmailParams) {
    // Format from field
    const from = typeof params.from === 'string' ? { email: params.from } : params.from;

    // Format to field
    let to: EmailUser[];
    if (Array.isArray(params.to)) {
        to = params.to.map((email) => ({ email })) as EmailUser[];
    } else {
        to = [{ email: params.to }] as EmailUser[];
    }

    const reply_to = typeof params.reply_to === 'string' ? { email: params.reply_to } : params.reply_to;

    return {
        from,
        to,
        reply_to,
        subject: params.subject,
        replyTo: params.reply_to,
        sendAt: params.send_at,
        content: [{ type: 'text/html', value: params.html }],
        personalizations: [{ to }],
    };
}
