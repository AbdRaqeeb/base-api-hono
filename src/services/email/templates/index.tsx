import { render } from '@react-email/components';
import { EmailTypeParams } from '../../../types';
import { EmailTypes } from '../../../types/enums';
import ForgotPasswordEmail from './ForgotPassword';
import ForgotPasswordEmailOtp from './ForgotPasswordOtp';
import MagicLinkEmail from './MagicLink';
import SignInOtpEmail from './SignInOtpEmail';
import TwoFactorAuthOtp from './TwoFactorAuthOtp';
import VerifyEmail from './VerifyEmail';
import VerifyEmailOtp from './VerifyEmailOtp';
import WelcomeEmail from './WelcomeEmail';

export function getEmailHtml<T extends EmailTypes>(emailType: T, emailTypeParams: EmailTypeParams[T]): Promise<string> {
    if (emailType === EmailTypes.WelcomeEmail) {
        return render(<WelcomeEmail {...(emailTypeParams as EmailTypeParams[EmailTypes.WelcomeEmail])} />);
    }

    if (emailType === EmailTypes.VerifyEmailOtp) {
        return render(<VerifyEmailOtp {...(emailTypeParams as EmailTypeParams[EmailTypes.VerifyEmailOtp])} />);
    }

    if (emailType === EmailTypes.ForgotPasswordOtp) {
        return render(
            <ForgotPasswordEmailOtp {...(emailTypeParams as EmailTypeParams[EmailTypes.ForgotPasswordOtp])} />
        );
    }

    if (emailType === EmailTypes.VerifyEmail) {
        return render(<VerifyEmail {...(emailTypeParams as EmailTypeParams[EmailTypes.VerifyEmail])} />);
    }

    if (emailType === EmailTypes.SignInOtp) {
        return render(<SignInOtpEmail {...(emailTypeParams as EmailTypeParams[EmailTypes.SignInOtp])} />);
    }

    if (emailType === EmailTypes.MagicLink) {
        return render(<MagicLinkEmail {...(emailTypeParams as EmailTypeParams[EmailTypes.MagicLink])} />);
    }

    if (emailType === EmailTypes.ForgotPassword) {
        return render(<ForgotPasswordEmail {...(emailTypeParams as EmailTypeParams[EmailTypes.ForgotPassword])} />);
    }

    if (emailType === EmailTypes.TwoFactorAuthOtp) {
        return render(<TwoFactorAuthOtp {...(emailTypeParams as EmailTypeParams[EmailTypes.TwoFactorAuthOtp])} />);
    }

    throw new Error('Invalid email type');
}
