import { sendgridService } from './sendgrid';
import * as types from '../../types';
import { EmailClient } from '../../types/enums';
import { mailgunService } from './mailgun';
import { brevoService } from './brevo';
import logger from '../../log';

export function newEmailService(es: types.EmailServiceStore): types.EmailService {
    async function sendEmailText(params: types.SendEmailTextParams, client?: EmailClient): Promise<void> {
        const { emailService } = es.getEmailAdapter(client);

        try {
            // send email
            await emailService.sendEmailText(params);
        } catch (error) {
            logger.error(error, '[EmailService][SendEmailText]');
        }
    }

    async function sendEmailTemplate(params: types.SendEmailTemplateParams, client?: EmailClient): Promise<void> {
        const { emailService } = es.getEmailAdapter(client);

        try {
            // send email
            await emailService.sendEmailTemplate(params);
        } catch (error) {
            logger.error(error, '[EmailService][SendEmailTemplate]');
        }
    }

    return { sendEmailText, sendEmailTemplate };
}

export function newEmailServiceStore(): types.EmailServiceStore {
    function getEmailAdapter(client: EmailClient = EmailClient.Sendgrid): types.EmailAdapter {
        switch (client) {
            case EmailClient.Mailgun:
                return { emailService: mailgunService() };

            case EmailClient.Brevo:
                return { emailService: brevoService() };

            case EmailClient.Sendgrid:
            default:
                return { emailService: sendgridService() };
        }
    }

    return { getEmailAdapter };
}

export * from '../../types/email';
