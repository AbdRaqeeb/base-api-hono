import nodemailer, { SendMailOptions } from 'nodemailer';
import { EmailClientService, SendEmailParams } from '../../types';
import Config from '../../config';
import logger from '../../log';

const transporter = nodemailer.createTransport({
    host: Config.smtp.host,
    port: Config.smtp.port,
    secure: Config.smtp.secure,
    auth: {
        user: Config.smtp.auth.user,
        pass: Config.smtp.auth.pass,
    },
});

export function nodemailerService(): EmailClientService {
    async function send(params: SendEmailParams): Promise<void> {
        try {
            const to = (Array.isArray(params.to) ? params.to : [params.to]) as string | string[];

            const options: SendMailOptions = {
                from: params.from as string,
                to,
                subject: params.subject,
                html: params.html,
                replyTo: params.reply_to as string,
                date: params.send_at.toString(),
            };

            await transporter.sendMail(options);
        } catch (error) {
            logger.error(error, '[NodemailerService][Send] - error');
        }
    }

    return { send };
}

export { transporter };
