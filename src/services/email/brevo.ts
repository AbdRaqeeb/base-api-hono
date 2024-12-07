import * as SibApiV3Sdk from '@getbrevo/brevo';
import Config from '../../config';
import { EmailClientService, EmailUser, SendEmailParams } from '../../types';
import logger from '../../log';
import { NO_REPLY, REPLY_TO } from '../../constants';

export const brevoInstance = new SibApiV3Sdk.TransactionalEmailsApi();
brevoInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, Config.brevoApiKey);

export function brevoService(): EmailClientService {
    async function send(params: SendEmailParams): Promise<void> {
        try {
            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
            const formattedParams = formatBrevoEmail(params);

            sendSmtpEmail.subject = formattedParams.subject;
            sendSmtpEmail.htmlContent = formattedParams.html;
            sendSmtpEmail.sender = formattedParams.from as EmailUser;
            sendSmtpEmail.to = formattedParams.to as EmailUser[];
            sendSmtpEmail.replyTo = formattedParams.reply_to as SibApiV3Sdk.SendSmtpEmailReplyTo;

            await brevoInstance.sendTransacEmail(sendSmtpEmail);
        } catch (error) {
            logger.error(error, '[BrevoService][Send] - error');
        }
    }

    return { send };
}

function formatBrevoEmail(params: SendEmailParams): SendEmailParams {
    const formattedParams = { ...params };

    // Format from field
    formattedParams.from = typeof params.from === 'string' ? { name: NO_REPLY, email: params.from } : params.from;

    // Format reply_to field
    if (params.reply_to) {
        formattedParams.reply_to =
            typeof params.reply_to === 'string' ? { name: REPLY_TO, email: params.reply_to } : params.reply_to;
    }

    // Format to field
    formattedParams.to = formatToField(params.to);

    return formattedParams;
}

function formatToField(to: string | EmailUser | string[] | EmailUser[]): EmailUser[] {
    if (typeof to === 'string') {
        return [{ name: '', email: to }];
    }

    if (!Array.isArray(to)) {
        return [to as EmailUser];
    }

    return to.map((recipient) => {
        if (typeof recipient === 'string') {
            return { name: '', email: recipient };
        }
        return recipient;
    });
}
