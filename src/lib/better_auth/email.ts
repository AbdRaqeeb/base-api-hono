import { emailService } from '../../services';
import { EmailClient, EmailTypes } from '../../types/enums';
import { FROM_UPDATE, FROM_BASE, OTP_EXPIRY } from '../../constants';

type SendVerificationOtp = {
    email: string;
    otp: string;
    type: 'sign-in' | 'email-verification' | 'forget-password';
};

type SendOtp = {
    user: { email: string };
    otp: string;
};

export const betterAuthEmails = {
    sendVerificationOTP: async ({ email, otp, type }: SendVerificationOtp) => {
        if (type === 'email-verification') {
            await emailService.send(
                EmailTypes.VerifyEmail,
                { otp, otpExpiry: `${OTP_EXPIRY.minutes.sixty.display} ${OTP_EXPIRY.minutes.sixty.unit}` },
                {
                    from: FROM_UPDATE,
                    to: email,
                    subject: 'Verify Email',
                },
                EmailClient.Resend
            );
            return;
        }

        if (type === 'forget-password') {
            await emailService.send(
                EmailTypes.ForgotPassword,
                { otp, otpExpiry: `${OTP_EXPIRY.minutes.sixty.display} ${OTP_EXPIRY.minutes.sixty.unit}` },
                {
                    from: FROM_BASE,
                    to: email,
                    subject: `Forgot Password?`,
                },
                EmailClient.Sendgrid
            );
            return;
        }

        if (type === 'sign-in') {
            await emailService.send(
                EmailTypes.SignInOtp,
                { otp, otpExpiry: `${OTP_EXPIRY.minutes.sixty.value} ${OTP_EXPIRY.minutes.sixty.unit}` },
                {
                    from: FROM_UPDATE,
                    to: email,
                    subject: `Sign In OTP`,
                },
                EmailClient.Resend
            );
            return;
        }
    },
    sendOTP: async ({ user, otp }: SendOtp) => {
        await emailService.send(
            EmailTypes.VerifyEmail,
            { otp, otpExpiry: `${OTP_EXPIRY.minutes.sixty.value} ${OTP_EXPIRY.minutes.sixty.unit}` },
            {
                from: FROM_UPDATE,
                to: user.email,
                subject: 'Your OTP',
            },
            EmailClient.Sendgrid
        );
    },
};
