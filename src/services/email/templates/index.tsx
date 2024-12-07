import { EmailTypes } from '../../../types/enums';
import { EmailTypeParams } from '../../../types';
import { render } from '@react-email/components';
import WelcomeEmail from './WelcomeEmail';
import VerifyEmail from './VerifyEmail';
import ForgotPassword from './ForgotPassword';

export function getEmailHtml<T extends EmailTypes>(emailType: T, emailTypeParams: EmailTypeParams[T]): Promise<string> {
    if (emailType === EmailTypes.WelcomeEmail) {
        return render(<WelcomeEmail {...(emailTypeParams as EmailTypeParams[EmailTypes.WelcomeEmail])} />);
    }

    if (emailType === EmailTypes.VerifyEmail) {
        return render(<VerifyEmail {...(emailTypeParams as EmailTypeParams[EmailTypes.VerifyEmail])} />);
    }

    if (emailType === EmailTypes.ForgotPassword) {
        return render(<ForgotPassword {...(emailTypeParams as EmailTypeParams[EmailTypes.ForgotPassword])} />);
    }

    throw new Error('Invalid email type');
}
