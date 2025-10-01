import { User as BetterAuthUser } from 'better-auth';
import { UserWithTwoFactor } from 'better-auth/plugins';
import { DateTime } from 'luxon';

import Config from '../../config';
import { APP_NAME, FROM_USER, JobNames, OTP_EXPIRY, VERIFY_EMAIL_DELAY_MINUTES } from '../../constants';
import { queue } from '../../services';
import { EmailClient, EmailTypes } from '../../types/enums';

type SendVerificationOtp = {
    email: string;
    otp: string;
    type: 'sign-in' | 'email-verification' | 'forget-password';
};

type SendVerificationEmail = {
    user: BetterAuthUser;
    url: string;
    token: string;
};

type ResetPasswordEmail = {
    user: BetterAuthUser;
    url: string;
    token: string;
};

type MagicLinkEmail = {
    email: string;
    url: string;
    token: string;
};

type TwoFactorAuth = {
    user: UserWithTwoFactor;
    otp: string;
};

export const betterAuthEmails = {
    sendVerificationOTP: async ({ email, otp, type }: SendVerificationOtp) => {
        if (type === 'email-verification') {
            await queue.email.add(JobNames.SendEmail, {
                emailType: EmailTypes.VerifyEmailOtp,
                emailTypeParams: {
                    otp,
                    otpExpiry: `${OTP_EXPIRY.minutes.sixty.display} ${OTP_EXPIRY.minutes.sixty.unit}`,
                },
                params: { from: FROM_USER, to: email, subject: 'Verify Email' },
                client: EmailClient.Resend,
            });
            return;
        }

        if (type === 'forget-password') {
            await queue.email.add(JobNames.SendEmail, {
                emailType: EmailTypes.ForgotPasswordOtp,
                emailTypeParams: {
                    otp,
                    otpExpiry: `${OTP_EXPIRY.minutes.sixty.display} ${OTP_EXPIRY.minutes.sixty.unit}`,
                },
                params: { from: FROM_USER, to: email, subject: `Forgot Password?` },
                client: EmailClient.Sendgrid,
            });
            return;
        }

        if (type === 'sign-in') {
            await queue.email.add(JobNames.SendEmail, {
                emailType: EmailTypes.SignInOtp,
                emailTypeParams: {
                    otp,
                    otpExpiry: `${OTP_EXPIRY.minutes.sixty.value} ${OTP_EXPIRY.minutes.sixty.unit}`,
                },
                params: { from: FROM_USER, to: email, subject: `Sign In OTP For ${APP_NAME}` },
                client: EmailClient.Resend,
            });
            return;
        }
    },
    sendVerificationEmail: async ({ user, token }: SendVerificationEmail, _request?: Request) => {
        const baseUrl = Config.appUrl;

        await queue.email.add(
            JobNames.SendEmail,
            {
                emailType: EmailTypes.WelcomeEmail,
                emailTypeParams: { url: `${baseUrl}/auth/login` },
                params: { from: FROM_USER, to: user.email, subject: `Welcome to ${APP_NAME}` },
                client: EmailClient.Resend,
            },
            {
                delay: DateTime.now().plus({ minute: VERIFY_EMAIL_DELAY_MINUTES }).toUTC().toMillis(),
            }
        );

        await queue.email.add(JobNames.SendEmail, {
            emailType: EmailTypes.VerifyEmail,
            emailTypeParams: { url: `${baseUrl}/auth/verification?token=${token}` },
            params: {
                from: FROM_USER,
                to: user.email,
                subject: `Verify Email`,
            },
            client: EmailClient.Resend,
        });
    },
    sendResetPasswordEmail: async ({ token, user }: ResetPasswordEmail, _request?: Request) => {
        await queue.email.add(JobNames.SendEmail, {
            emailType: EmailTypes.ForgotPassword,
            emailTypeParams: {
                url: `${Config.appUrl}/auth/reset-password?token=${token}`,
                expiry: `${OTP_EXPIRY.minutes.sixty.display} ${OTP_EXPIRY.minutes.sixty.unit}`,
            },
            params: { from: FROM_USER, to: user.email, subject: `Forgot Password?` },
            client: EmailClient.Resend,
        });
    },
    sendMagicLinkEmail: async ({ email, token }: MagicLinkEmail, request?: Request) => {
        const url = new URL(request?.url || Config.baseUrl);
        const params = url.searchParams;
        const newUser = params.get('new_user');

        if (newUser === 'true') {
            await queue.email.add(
                JobNames.SendEmail,
                {
                    emailType: EmailTypes.WelcomeEmail,
                    emailTypeParams: { url: `${Config.appUrl}/magic?token=${token}` },
                    params: { from: FROM_USER, to: email, subject: `Welcome to ${APP_NAME}` },
                    client: EmailClient.Resend,
                },
                {
                    delay: DateTime.now().plus({ minute: VERIFY_EMAIL_DELAY_MINUTES }).toUTC().toMillis(),
                }
            );
            return;
        }

        await queue.email.add(JobNames.SendEmail, {
            emailType: EmailTypes.MagicLink,
            emailTypeParams: { link: `${Config.appUrl}/magic?token=${token}` },
            params: { from: FROM_USER, to: email, subject: `Sign In To ${APP_NAME}` },
            client: EmailClient.Resend,
        });
    },
    sendTwoFactorAuthEmail: async ({ user, otp }: TwoFactorAuth, _request?: Request) => {
        await queue.email.add(JobNames.SendEmail, {
            emailType: EmailTypes.TwoFactorAuthOtp,
            emailTypeParams: { otp, otpExpiry: '5 minutes' },
            params: { from: FROM_USER, to: user.email, subject: `${APP_NAME}: Complete Your Sign In - 2FA Code` },
            client: EmailClient.Resend,
        });
    },
};
