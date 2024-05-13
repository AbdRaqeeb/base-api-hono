import formData from 'form-data';
import Mailgun, { MailgunMessageData } from 'mailgun.js';
import Config from '../../config';
import { EmailClientService, SendEmailTemplateParams, SendEmailTextParams } from '../../types';
import { EmailTypes } from '../../types/enums';
import logger from '../../log';

const mailgun = new Mailgun(formData);

export const mg = mailgun.client({
    username: 'api',
    key: Config.mailgunApiKey,
});

export function mailgunService(): EmailClientService {
    async function sendEmailText(params: SendEmailTextParams): Promise<void> {
        try {
            const { subject, body, from } = params;

            const to = (params.to && typeof params.to == 'string' ? [params.to] : params.to) as string | string[];

            const data: MailgunMessageData = { from: <string>from, to, subject, html: body };

            if (params.reply_to) data['h:Reply-To'] = params.reply_to;
            if (params.delivery_time) data['o:deliverytime'] = params.delivery_time;
            if (params.tracking) data['o:tracking'] = params.tracking;
            if (params.track_clicks) data['o:tracking-clicks'] = params.track_clicks;
            if (params.track_opens) data['o:tracking-opens'] = params.track_opens;
            if (params.tags) data['o:tag'] = params.tags;
            if (params.recipient_variables) data['recipient-variables'] = JSON.stringify(params.recipient_variables);

            // send email
            await mg.messages.create(Config.mailgunDomainName, data);
        } catch (error) {
            logger.error(error, '[MailgunService][SendEmailText] - error');
        }
    }

    async function sendEmailTemplate(params: SendEmailTemplateParams): Promise<void> {
        try {
            const to = (params.to && typeof params.to == 'string' ? [params.to] : params.to) as string | string[];

            const template = getTemplateId(params.emailType);

            const data: MailgunMessageData = {
                to: to,
                subject: params.subject,
                from: <string>params.from,
                template,
                'h:X-Mailgun-Variables': JSON.stringify(params.templateData),
                'h:Reply-To': params.reply_to,
            };

            await mg.messages.create(Config.mailgunDomainName, data);
        } catch (error) {
            logger.error(error, '[MailgunService][SendEmailText] - error');
        }
    }

    function getTemplateId(email_type: EmailTypes) {
        switch (email_type) {
            case EmailTypes.ConfirmEmail:
                return 'confirm_email';
            case EmailTypes.ResetPassword:
                return 'reset_password';
            default:
                throw new Error('Unknown Email Type');
        }
    }

    return { sendEmailText, sendEmailTemplate };
}
