import Config from '../config';
import project from '../project';

export const DEFAULT_SIZE = 20;
export const SALT_VALUE = 10;
export const PASSWORD_REGEX = '^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\\d]){1,})(?=(.*[\\W]){1,})(?!.*\\s).{8,}$';
export const NO_REPLY = 'no-reply@varteqar.com';
export const REPLY_TO = 'reply-to@varteqar.com';
export const FROM_UPDATE = 'Base API <no-reply@updates.varteqar.com>';
export const FROM_BASE = 'Base API <no-reply@varteqar.com>';
export const FROM_UPDATE_EMAIL = 'no-reply@updates.varteqar.com';
export const FROM_BASE_EMAIL = 'no-reply@varteqar.com';
export const FROM_NAME = 'Varteqar';
export const FROM_USER = 'Varteqar <no-reply@updates.varteqar.com>';
export const APP_LOGO = 'https://s3.varteqar.org/alifhub/logo.png';
export const COMPANY_ADDRESS = 'Abuja, Nigeria';
export const APP_NAME = 'Varteqar';
export const VERIFY_EMAIL_DELAY_MINUTES = 30;

export const OTP_EXPIRY = {
    minutes: {
        sixty: {
            value: 60 * 60 * 1000,
            unit: 'minutes',
            display: '60',
        },
    },
};

// cache prefixes
export const USERNAME_CACHE_PREFIX = `${Config.appStage}:${project.redisPrefix}:username:`;
