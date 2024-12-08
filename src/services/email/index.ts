import { sendgridService } from './sendgrid';
import { EmailAdapter, EmailService, EmailServiceStore, EmailTypeParams, SendEmailParams } from '../../types';
import { EmailClient, EmailTypes } from '../../types/enums';
import { brevoService } from './brevo';
import logger from '../../log';
import { getEmailHtml } from './templates';
import { resendService } from './resend';
import { nodemailerService } from './nodemailer';

export function newEmailService(es: EmailServiceStore): EmailService {
    async function send<T extends EmailTypes>(
        emailType: T,
        emailTypeParams: EmailTypeParams[T],
        params: SendEmailParams,
        client?: EmailClient
    ): Promise<void> {
        const { emailService } = es.getEmailAdapter(client);

        try {
            // send email
            params.html = await getEmailHtml(emailType, emailTypeParams);
            await emailService.send(params);
        } catch (error) {
            logger.error(error, '[EmailService][SendEmail]');
        }
    }

    return { send };
}

export function newEmailServiceStore(): EmailServiceStore {
    function getEmailAdapter(client: EmailClient = EmailClient.Sendgrid): EmailAdapter {
        switch (client) {
            case EmailClient.Resend:
                return { emailService: resendService() };

            case EmailClient.Brevo:
                return { emailService: brevoService() };

            case EmailClient.Sendgrid:
                return { emailService: sendgridService() };

            case EmailClient.Nodemailer:
            default:
                return { emailService: nodemailerService() };
        }
    }

    return { getEmailAdapter };
}

export const emailService = newEmailService(newEmailServiceStore());
