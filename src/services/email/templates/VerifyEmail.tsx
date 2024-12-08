import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from '@react-email/components';
import { VerifyEmailProps } from '../../../types';

export const VerifyEmail = ({ otp = '123456', otpExpiry = '10 minutes' }: VerifyEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Verify your email address</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Verify Your Email Address</Heading>

                    <Text style={text}>Hi,</Text>
                    <Text style={text}>
                        Thanks for signing up! Please use the verification code below to verify your email address:
                    </Text>

                    <Section style={otpContainer}>
                        <Text style={otpText}>{otp}</Text>
                    </Section>

                    <Text style={text}>This verification code will expire in {otpExpiry}.</Text>

                    <Text style={text}>If you did not create an account, you can safely ignore this email.</Text>

                    <Hr style={hr} />

                    <Text style={footer}>For security reasons, never share this verification code with anyone.</Text>
                    <Text style={footer}>Need help? Contact our support team.</Text>
                </Container>
            </Body>
        </Html>
    );
};

export default VerifyEmail;

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
