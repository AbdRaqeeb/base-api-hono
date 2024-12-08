import { Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from '@react-email/components';
import { WelcomeEmailProps } from '../../../types';

export const WelcomeEmail = ({
    userName = 'John',
    dashboardLink = 'https://dashboard.example.com',
    appName = 'Base API',
}: WelcomeEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Welcome to Our Platform - Get Started</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Welcome to {appName}! 👋</Heading>

                    <Text style={text}>Hi {userName},</Text>
                    <Text style={text}>
                        Thank you for joining our platform! We're thrilled to have you as part of our community.
                    </Text>

                    <Section style={boxContainer}>
                        <Heading style={h2}>Getting Started:</Heading>
                        <Text style={text}>→ Complete your profile</Text>
                        <Text style={text}>→ Explore our features</Text>
                    </Section>

                    <Text style={text}>
                        If you have any questions, feel free to reply to this email - we're always here to help!
                    </Text>

                    <Section style={buttonContainer}>
                        <Link style={button} href={dashboardLink}>
                            Get Started
                        </Link>
                    </Section>

                    <Hr style={hr} />

                    <Text style={footer}>Best regards,</Text>
                    <Text style={footer}>The Team</Text>
                </Container>
            </Body>
        </Html>
    );
};

export default WelcomeEmail;

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

const h2 = {
    color: '#1a1a1a',
    fontSize: '20px',
    fontWeight: '600',
    lineHeight: '36px',
    margin: '0 0 10px',
};

const text = {
    color: '#444',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 10px',
};

const buttonContainer = {
    margin: '24px 0',
};

const button = {
    backgroundColor: '#2563eb',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    lineHeight: '100%',
    padding: '12px 24px',
    textDecoration: 'none',
    textAlign: 'center' as const,
};

const boxContainer = {
    background: '#f9fafb',
    borderRadius: '6px',
    padding: '24px',
    margin: '20px 0',
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
