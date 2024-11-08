import { NODE_ENV } from '../types/enums';

export interface Config {
    port: number;
    nodeEnv: NODE_ENV;
    databaseUrl: string;
    databaseSchema: string;
    liveTailSourceToken: string;
    jwtSecret: string;
    jwtExpiry: string;
    mailgunApiKey: string;
    mailgunDomainName: string;
    sendGridApiKey: string;
    brevoApiKey: string;
}

export const getConfig = (): Config => {
    const required: string[] = ['NODE_ENV', 'DATABASE_URL', 'DATABASE_SCHEMA'];

    if (!process.env.CI) {
        // Do not require this check in CI
        required.forEach((variable) => {
            if (!process.env[variable]) throw new Error(`${variable} env not set`);
        });
    }

    return {
        port: Number(process.env.PORT) || 6050,
        nodeEnv: (process.env.NODE_ENV as NODE_ENV) || NODE_ENV.DEVELOPMENT,
        databaseUrl: process.env.DATABASE_URL,
        databaseSchema: process.env.DATABASE_SCHEMA,
        liveTailSourceToken: process.env.LIVE_TAIL_SOURCE_TOKEN || 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        jwtSecret: process.env.JWT_SECRET || 'woohoo',
        jwtExpiry: process.env.JWT_EXPIRY || '2d',
        mailgunApiKey: process.env.MAILGUN_API_KEY || 'xxxxxxxxxxxxxxxxxxxxx',
        mailgunDomainName: process.env.MAILGUN_DOMAIN_NAME || 'domain',
        sendGridApiKey: process.env.SENDGRID_API_KEY || 'SG.xxxxxxxxxxxxxxxxx',
        brevoApiKey: process.env.BREVO_API_KEY || 'xxxxxxxxxxxxxxxxxx',
    };
};
