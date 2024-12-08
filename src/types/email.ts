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
    tags?: string[];
    html?: string;
}

export interface EmailService {
    send<T extends EmailTypes>(
        emailType: T,
        emailTypeParams: EmailTypeParams[T],
        params: SendEmailParams,
        client?: EmailClient
    ): Promise<void>;
}

export interface EmailClientService {
    send(params: SendEmailParams): Promise<void>;
}

export interface ForgotPasswordEmailProps {
    otp: string;
    otpExpiry: string;
}

export interface VerifyEmailProps {
    otp: string;
    otpExpiry: string;
}

export interface WelcomeEmailProps {
    userName: string;
    dashboardLink: string;
    appName: string;
}

export interface SignInOtpEmailProps {
    otp: string;
    otpExpiry: string;
}

export interface EmailTypeParams {
    [EmailTypes.WelcomeEmail]: WelcomeEmailProps;
    [EmailTypes.VerifyEmail]: VerifyEmailProps;
    [EmailTypes.ForgotPassword]: ForgotPasswordEmailProps;
    [EmailTypes.SignInOtp]: SignInOtpEmailProps;
}
