import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from '@react-email/components';
import { SignInOtpEmailProps } from '../../../types';

export const SignInOtpEmail = ({ otp = '123456', otpExpiry = '5 minutes' }: SignInOtpEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Your sign-in code for secure access</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Sign In Verification</Heading>

                    <Text style={text}>Hi,</Text>
                    <Text style={text}>
                        Use the following code to sign in to your account. This code expires in {otpExpiry}.
                    </Text>

                    <Section style={otpContainer}>
                        <Text style={otpText}>{otp}</Text>
                    </Section>

                    {/*<Section style={infoContainer}>*/}
                    {/*    <Text style={infoHeader}>Sign-in attempt details:</Text>*/}
                    {/*    <Text style={infoText}>• Device: {deviceInfo}</Text>*/}
                    {/*    <Text style={infoText}>• Location: {location}</Text>*/}
                    {/*    <Text style={infoText}>• Time: {new Date().toUTCString()}</Text>*/}
                    {/*</Section>*/}

                    <Text style={text}>
                        If you didn't try to sign in, someone else may be trying to access your account. Please change
                        your password immediately.
                    </Text>

                    <Hr style={hr} />

                    <Text style={footer}>
                        For security reasons, never share this code with anyone. Our team will never ask for your
                        sign-in code.
                    </Text>
                    <Text style={footer}>
                        If you're concerned about your account's security, please contact our support team immediately.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default SignInOtpEmail;

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

const infoContainer = {
    background: '#f9fafb',
    borderRadius: '6px',
    padding: '16px',
    margin: '20px 0',
};

const infoHeader = {
    color: '#1a1a1a',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 8px',
};

const infoText = {
    color: '#666666',
    fontSize: '14px',
    margin: '4px 0',
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
