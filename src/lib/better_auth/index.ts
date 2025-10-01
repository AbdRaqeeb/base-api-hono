import { betterAuth, BetterAuthOptions } from 'better-auth';
import {
    admin,
    bearer,
    customSession,
    emailOTP,
    jwt,
    magicLink,
    openAPI,
    twoFactor,
    username,
} from 'better-auth/plugins';
import { Pool } from 'pg';

import Config from '../../config';
import { OTP_EXPIRY } from '../../constants';
import project from '../../project';
import { betterAuthEmails } from './email';
import { schema } from './schema';
import { redis, database } from '../../database';
import { hooks, usernameUpdatePlugin } from './utils';
import { NODE_ENV } from '../../types/enums';
import { createRepositories } from '../../repositories';
import { createCacheService } from '../../services';

const isProd = Config.nodeEnv === NODE_ENV.PRODUCTION;

const repo = createRepositories(database);
const cache = createCacheService(redis, repo);

export const auth = betterAuth({
    appName: project.appName,
    baseURL: Config.baseUrl,
    secret: Config.betterAuthSecret,
    trustedOrigins: Config.trustedOrigins,
    database: new Pool({ connectionString: Config.databaseUrl }),
    emailAndPassword: {
        enabled: true,
        sendResetPassword: betterAuthEmails.sendResetPasswordEmail,
        resetPasswordTokenExpiresIn: OTP_EXPIRY.minutes.sixty.value,
        requireEmailVerification: true,
    },
    emailVerification: {
        autoSignInAfterVerification: true,
        sendVerificationEmail: betterAuthEmails.sendVerificationEmail,
    },
    socialProviders: {
        google: {
            clientId: Config.google.client_id,
            clientSecret: Config.google.client_secret,
            redirectURI: `${Config.baseUrl}/api/auth/callback/google`,
            mapProfileToUser: (profile) => {
                return { firstName: profile.given_name, lastName: profile.family_name };
            },
            display: 'popup',
        },
        github: {
            clientId: Config.github.client_id,
            clientSecret: Config.github.client_secret,
        },
    },
    user: { ...schema.user, deleteUser: { enabled: true } },
    session: {
        ...schema.session,
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60,
        },
    },
    verification: { ...schema.verification },
    account: { ...schema.account },
    advanced: {
        cookiePrefix: project.cookiePrefix,
        cookies: { session_token: { name: project.sessionTokenName } },
        crossSubDomainCookies: isProd ? { enabled: true, domain: Config.baseDomain } : { enabled: false },
        useSecureCookies: isProd,
    },
    secondaryStorage: {
        get: async (key) => {
            const value = await redis.get(key);
            return value ? value : null;
        },
        set: async (key, value, ttl) => {
            if (ttl) {
                await redis.set(key, value, 'EX', ttl);
                return;
            }

            await redis.set(key, value);
        },
        delete: async (key) => {
            await redis.del(key);
        },
    },
    databaseHooks: { user: hooks.user(cache, repo) },
    plugins: [
        username({
            schema: { user: schema.username },
            usernameValidator: (username) => {
                const restrictedUsernames = ['user', 'admin', 'alif', 'alifhub'];
                return !restrictedUsernames.includes(username);
            },
        }),
        emailOTP({
            otpLength: 6,
            expiresIn: OTP_EXPIRY.minutes.sixty.value,
            sendVerificationOnSignUp: true,
            disableSignUp: true,
            sendVerificationOTP: betterAuthEmails.sendVerificationOTP,
        }),
        magicLink({
            expiresIn: OTP_EXPIRY.minutes.sixty.value,
            sendMagicLink: betterAuthEmails.sendMagicLinkEmail,
        }),
        jwt({ schema: { jwks: { ...schema.jwks } } }),
        customSession(async ({ user, session }) => {
            return { user, session };
        }),
        twoFactor({
            issuer: project.appName,
            otpOptions: { sendOTP: betterAuthEmails.sendTwoFactorAuthEmail },
            schema: { user: schema.twoFactor.user, twoFactor: schema.twoFactor.core },
        }),
        admin({
            adminRoles: ['admin', 'super-admin'],
            schema: { ...schema.admin },
        }),
        openAPI(),
        usernameUpdatePlugin(cache),
        bearer(),
    ],
} satisfies BetterAuthOptions);
