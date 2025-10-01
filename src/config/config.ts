import { NODE_ENV } from '../types/enums';
import process from 'node:process';

export interface Config {
    port: number;
    nodeEnv: NODE_ENV;
    databaseUrl: string;
    databaseSchemas: string[];
    liveTailSourceToken: string;
    liveTailIngestingHost: string;
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
    };
    google: {
        client_id: string;
        client_secret: string;
    };
    github: {
        client_id: string;
        client_secret: string;
    };
    betterAuthSecret: string;
    trustedOrigins: string[];
    baseUrl: string;
    baseDomain: string;
    redisUrl: string;
    appUrl: string;
    appStage: string;
    auth: {
        username: string;
        password: string;
    };
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
        liveTailIngestingHost: process.env.LIVE_TAIL_INGESTING_HOST || '',
        jwtSecret: process.env.JWT_SECRET || 'woohoo',
        jwtExpiry: process.env.JWT_EXPIRY || '2d',
        sendGridApiKey: process.env.SENDGRID_API_KEY || 'SG.xxxxxxxxxxxxxxxxx',
        brevoApiKey: process.env.BREVO_API_KEY || 'xxxxxxxxxxxxxxxxxx',
        resendApiKey: process.env.RESEND_API_KEY || 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        smtp: {
            host: process.env.SMTP_HOST || 'smtp.example.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === '1',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        },
        google: {
            client_id: process.env.GOOGLE_CLIENT_ID || 'xxxxxxxxxxxxxxxxxxx',
            client_secret: process.env.GOOGLE_CLIENT_SECRET || 'xxxxxxxxxxxxxxxxxxx',
        },
        github: {
            client_id: process.env.GITHUB_CLIENT_ID || 'xxxxxxxxxxxxxxxxxxx',
            client_secret: process.env.GITHUB_CLIENT_SECRET || 'xxxxxxxxxxxxxxxxxxx',
        },
        betterAuthSecret: process.env.BETTER_AUTH_SECRET || 'xxxxxxxxxxxxxxxxxx',
        trustedOrigins: process.env.TRUSTED_ORIGINS?.split(',') || [],
        baseUrl: process.env.BASE_URL || 'http://localhost:3034',
        baseDomain: process.env.BASE_DOMAIN || 'example.com',
        redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
        appUrl: process.env.APP_URL || 'http://localhost:3472',
        appStage: process.env.APP_STAGE || 'dev',
        auth: {
            username: process.env.AUTH_USERNAME || '',
            password: process.env.AUTH_PASSWORD || '',
        },
    };
};
