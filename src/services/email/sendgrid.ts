import sgMail from '@sendgrid/mail';
import { EmailClientService, SendEmailTemplateParams, SendEmailTextParams } from '../../types';
import { EmailTypes } from '../../types/enums';
import Config from '../../config';
import logger from '../../log';

sgMail.setApiKey(Config.sendGridApiKey);

export function getTemplateId(email_type: EmailTypes) {
    /* SET EMAIL TEMPLATES ID FROM SENDGRID */
    switch (email_type) {
        case EmailTypes.VerifyEmail:
            return '';
        case EmailTypes.ResetPassword:
            return '';
        case EmailTypes.SetPassword:
            return '';
        case EmailTypes.AdminCredentials:
            return '';
        default:
            throw new Error('Unknown Email Type');
    }
}

export function sendgridService(): EmailClientService {
    async function sendEmailText(sendEmailParams: SendEmailTextParams): Promise<void> {
        try {
            const { subject, body, from, reply_to, send_at } = sendEmailParams;

            const to =
                sendEmailParams.to && typeof sendEmailParams.to == 'string' ? [sendEmailParams.to] : sendEmailParams.to;

            const msg = { to, from, subject, html: body, replyTo: reply_to, sendAt: send_at };

            // send email
            await sgMail.send(msg);
        } catch (error) {
            logger.error(error, '[SendgridService][SendEmailText] - error');
        }
    }

    async function sendEmailTemplate(params: SendEmailTemplateParams): Promise<void> {
        try {
            const to = params.to && typeof params.to == 'string' ? [params.to] : params.to;

            const templateId = getTemplateId(params.emailType);

            const msg = {
                to,
                subject: params.subject,
                from: params.from,
                templateId: `${templateId}`,
                dynamicTemplateData: params.templateData,
            };

            await sgMail.send(msg);
        } catch (error) {
            logger.error(error, '[SendgridService][SendEmailTemplate] - error');
        }
    }

    return { sendEmailText, sendEmailTemplate };
}

export { sgMail };
