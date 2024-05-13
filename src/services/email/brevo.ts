import * as SibApiV3Sdk from '@getbrevo/brevo';

import Config from '../../config';
import * as types from '../../types';
import { EmailTypes } from '../../types/enums';
import logger from '../../log';
import { NO_REPLY, REPLY_TO } from '../../constants';

export const brevoInstance = new SibApiV3Sdk.TransactionalEmailsApi();
brevoInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, Config.brevoApiKey);

export function getTemplateId(email_type: EmailTypes) {
    /* SET EMAIL TEMPLATES ID FROM BREVO */
    switch (email_type) {
        case EmailTypes.ConfirmEmail:
            return 0;
        case EmailTypes.ResetPassword:
            return 0;
        case EmailTypes.SetPassword:
            return 0;
        case EmailTypes.AdminCredentials:
            return 0;
        default:
            throw new Error('Unknown Email Type');
    }
}

export function brevoService(): types.EmailClientService {
    async function sendEmailText(params: types.SendEmailTextParams): Promise<void> {
        try {
            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

            const values = formatBrevoEmail(params);

            sendSmtpEmail.subject = values.subject;
            sendSmtpEmail.textContent = values.body;
            sendSmtpEmail.sender = values.from as types.EmailUser;
            sendSmtpEmail.to = values.to as types.EmailUser[];
            sendSmtpEmail.replyTo = values.reply_to as SibApiV3Sdk.SendSmtpEmailReplyTo;

            // send email
            await brevoInstance.sendTransacEmail(sendSmtpEmail);
        } catch (error) {
            logger.error(error, '[BrevoService][SendEmailText] - error');
        }
    }

    async function sendEmailTemplate(params: types.SendEmailTemplateParams): Promise<void> {
        try {
            const templateId = getTemplateId(params.emailType);
            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
            const values = formatBrevoEmail(params);

            sendSmtpEmail.subject = values.subject;
            sendSmtpEmail.templateId = templateId;
            sendSmtpEmail.sender = values.from as types.EmailUser;
            sendSmtpEmail.to = values.to as types.EmailUser[];
            sendSmtpEmail.params = values.templateData;
            sendSmtpEmail.replyTo = values.reply_to as SibApiV3Sdk.SendSmtpEmailReplyTo;

            // send email
            await brevoInstance.sendTransacEmail(sendSmtpEmail);
        } catch (error) {
            logger.error(error, '[BrevoService][SendEmailText] - error');
        }
    }

    return { sendEmailText, sendEmailTemplate };
}

function formatBrevoEmail<T extends types.SendEmailParams>(params: T): T {
    if (typeof params.from === 'string') {
        params.from = {
            name: NO_REPLY,
            email: params.from,
        };
    }

    if (params.reply_to && typeof params.reply_to === 'string') {
        params.reply_to = {
            name: REPLY_TO,
            email: params.reply_to,
        };
    }

    if (Array.isArray(params.to) && typeof params.to !== 'string') {
        params.to = params.to.forEach((value) => ({
            name: '',
            email: value,
        })) as unknown as types.EmailUser[];
    }

    if (!Array.isArray(params.to) && typeof params.to !== 'string') {
        params.to = [params.to];
    }

    if (typeof params.to === 'string') {
        params.to = [{ name: '', email: params.to }];
    }

    return params;
}
