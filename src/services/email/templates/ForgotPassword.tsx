import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from '@react-email/components';
import { ForgotPasswordEmailProps } from '../../../types';

export const ForgotPasswordEmail = ({
    otp = '123456',
    otpExpiry = '10 minutes',
}: ForgotPasswordEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Forgot your password?</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Forgot Your Password?</Heading>

                    <Text style={text}>Hi,</Text>
                    <Text style={text}>
                        We received a request to reset your password. Use the OTP below to complete the process:
                    </Text>

                    <Section style={otpContainer}>
                        <Text style={otpText}>{otp}</Text>
                    </Section>

                    <Text style={text}>
                        This OTP will expire in {otpExpiry}. If you didn't request this password reset, please ignore
                        this email.
                    </Text>

                    <Hr style={hr} />

                    <Text style={footer}>For security reasons, never share this OTP with anyone.</Text>
                    <Text style={footer}>If you're having trouble, please contact our support team.</Text>
                </Container>
            </Body>
        </Html>
    );
};

export default ForgotPasswordEmail;

const main = {
    backgroundColor: '#ffffff',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    width: '580px',
};

const h1 = {
    color: '#1a1a1a',
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '40px',
    margin: '0 0 20px',
};

const text = {
    color: '#444',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 10px',
};

const otpContainer = {
    background: '#f9fafb',
    borderRadius: '6px',
    margin: '24px 0',
    padding: '24px',
    textAlign: 'center' as const,
};

const otpText = {
    color: '#1a1a1a',
    fontSize: '32px',
    fontWeight: '700',
    letterSpacing: '8px',
    margin: '0',
};

const hr = {
    borderColor: '#e5e5e5',
    margin: '20px 0',
};

const footer = {
    color: '#666666',
    fontSize: '14px',
    lineHeight: '24px',
    margin: '0 0 4px',
};
