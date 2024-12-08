export const schema: Record<string, any> = {
    user: {
        modelName: 'users',
        fields: {
            name: 'full_name',
            emailVerified: 'email_verified',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            twoFactorEnabled: 'two_factor_enabled',
        },
        additionalFields: {
            first_name: {
                type: 'string',
                required: false,
            },
            last_name: {
                type: 'string',
                required: false,
            },
        },
    },
    session: {
        modelName: 'sessions',
        fields: {
            expiresAt: 'expires_at',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            ipAddress: 'ip_address',
            userAgent: 'user_agent',
            userId: 'user_id',
        },
    },
    account: {
        modelName: 'accounts',
        fields: {
            accountId: 'account_id',
            providerId: 'provider_id',
            userId: 'user_id',
            accessToken: 'access_token',
            refreshToken: 'refresh_token',
            idToken: 'id_token',
            accessTokenExpiresAt: 'access_token_expires_at',
            refreshTokenExpiresAt: 'refresh_token_expires_at',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
    verification: {
        modelName: 'verifications',
        fields: {
            expiresAt: 'expires_at',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
    jwks: {
        modelName: 'jwks',
        fields: {
            publicKey: 'public_key',
            privateKey: 'private_key',
            createdAt: 'created_at',
        },
    },
    twoFactor: {
        modelName: 'two_factors',
        fields: {
            backupCodes: 'backup_codes',
            userId: 'user_id',
        },
    },
};
