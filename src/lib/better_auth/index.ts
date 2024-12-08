import { betterAuth } from 'better-auth';
import { bearer, emailOTP, jwt, openAPI, username } from 'better-auth/plugins';
import { Pool } from 'pg';

import Config from '../../config';
import { OTP_EXPIRY } from '../../constants';
import project from '../../project';
import { betterAuthEmails } from './email';
import { schema } from './schema';

export const auth = betterAuth({
    appName: project.name,
    database: new Pool({
        connectionString: Config.databaseUrl,
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: Config.google.client_id,
            clientSecret: Config.google.client_secret,
        },
        github: {
            clientId: Config.github.client_id,
            clientSecret: Config.github.client_secret,
        },
    },
    plugins: [
        emailOTP({
            otpLength: 6,
            expiresIn: OTP_EXPIRY.minutes.sixty.value,
            sendVerificationOnSignUp: true,
            disableSignUp: true,
            sendVerificationOTP: betterAuthEmails.sendVerificationOTP,
        }),
        username(),
        openAPI(),
        jwt(),
        bearer(),
    ],
    user: { ...schema.user },
    session: { ...schema.session },
    verification: { ...schema.verification },
    account: { ...schema.account },
    jwks: { ...schema.jwks },
});
