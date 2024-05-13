import { EmailClient, EmailTypes } from './enums';

export interface EmailAdapter {
    emailService: EmailClientService;
}

export interface EmailServiceStore {
    getEmailAdapter: (client?: EmailClient) => EmailAdapter;
}

export type EmailUser = { name?: string; email: string };

export interface SendEmailParams {
    from: string | EmailUser;
    subject?: string;
    to: string | string[] | EmailUser | EmailUser[];
    reply_to?: string | EmailUser;
    send_at?: number;
    delivery_time?: string;
    tracking?: boolean;
    track_clicks?: boolean;
    track_opens?: boolean;
    tags?: string[];
    recipient_variables?: { [key: string]: string };
}

export interface SendEmailTextParams extends SendEmailParams {
    body: string;
}

export interface SendEmailTemplateParams extends SendEmailParams {
    emailType: EmailTypes;
    templateData: { [key: string]: unknown };
}

export interface EmailService {
    sendEmailText(params: SendEmailTextParams, client?: EmailClient): Promise<void>;
    sendEmailTemplate(params: SendEmailTemplateParams, client?: EmailClient): Promise<void>;
}

export interface EmailClientService {
    sendEmailText(params: SendEmailTextParams): Promise<void>;
    sendEmailTemplate(params: SendEmailTemplateParams): Promise<void>;
}
