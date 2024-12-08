import Config from '../../config';
import { FROM_NAME } from '../../constants';
import { request } from '../../lib';
import logger from '../../log';
import { EmailClientService, EmailUser, SendEmailParams } from '../../types';

export function brevoService(): EmailClientService {
    async function send(params: SendEmailParams): Promise<void> {
        try {
            const payload = formatPayload(params);

            await request.post('https://api.brevo.com/v3/smtp/email', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'api-key': Config.brevoApiKey,
                },
            });
        } catch (error) {
            logger.error(error, '[BrevoService][Send] - error');
        }
    }

    return { send };
}

function formatPayload(params: SendEmailParams) {
    const payload: Record<string, unknown> = {
        subject: params.subject,
        htmlContent: params.html,
        sender: typeof params.from === 'string' ? { name: FROM_NAME, email: params.from } : params.from,
        to: formatToField(params.to),
    };

    // Format reply_to field
    if (params.reply_to && typeof params.reply_to === 'string') {
        payload.replyTo = { name: FROM_NAME, email: params.reply_to };
    } else if (params.reply_to) {
        payload.replyTo = params.reply_to;
    }

    return payload;
}

function formatToField(to: string | EmailUser | string[] | EmailUser[]): EmailUser[] {
    if (typeof to === 'string') {
        return [{ email: to }];
    }

    if (!Array.isArray(to)) {
        return [to as EmailUser];
    }

    return to.map((recipient) => {
        if (typeof recipient === 'string') {
            return { email: recipient };
        }
        return recipient;
    });
}
