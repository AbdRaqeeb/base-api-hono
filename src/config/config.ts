import { NODE_ENV } from '../types/enums';

export interface Config {
    port: number;
    nodeEnv: NODE_ENV;
    databaseUrl: string;
    databaseSchemas: string[];
    liveTailSourceToken: string;
    jwtSecret: string;
    jwtExpiry: string;
    sendGridApiKey: string;
    brevoApiKey: string;
    resendApiKey: string;
    smtp: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string;
            pass: string;
        };
    }
}

export const getConfig = (): Config => {
    const required: string[] = ['NODE_ENV', 'DATABASE_URL', 'DATABASE_SCHEMAS'];

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
        databaseSchemas: process.env.DATABASE_SCHEMAS?.split(','),
        liveTailSourceToken: process.env.LIVE_TAIL_SOURCE_TOKEN || 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        jwtSecret: process.env.JWT_SECRET || 'woohoo',
        jwtExpiry: process.env.JWT_EXPIRY || '2d',
        sendGridApiKey: process.env.SENDGRID_API_KEY || 'SG.xxxxxxxxxxxxxxxxx',
        brevoApiKey: process.env.BREVO_API_KEY || 'xxxxxxxxxxxxxxxxxx',
        resendApiKey: process.env.RESEND_API_KEY || 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        smtp: {
            host: process.env.SMTP_HOST ||'smtp.example.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === '1',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        }
    };
};
