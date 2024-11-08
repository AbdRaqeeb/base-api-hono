export enum HttpStatusCode {
    Ok = 200,
    Created = 201,
    NoContent = 204,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    MethodNotAllowed = 405,
    InternalServerError = 500,
    BadGateway = 502,
    ServiceUnavailable = 503,
    GatewayTimeout = 504,
}

export enum NODE_ENV {
    DEVELOPMENT = 'development',
    PRODUCTION = 'production',
    TEST = 'test',
}

export enum LogLevels {
    fatal = 'fatal',
    error = 'error',
    warn = 'warn',
    info = 'info',
    debug = 'debug',
    trace = 'trace',
    silent = 'silent',
}

export enum AgeRange {
    CHILD = '0-12',
    TEENAGER = '13-19',
    YOUNG_ADULT = '20-35',
    ADULT = '36-60',
    SENIOR = '61+',
}

export enum EmailClient {
    Mailgun = 'Mailgun',
    Sendgrid = 'Sendgrid',
    Brevo = 'Brevo',
}

export enum EmailTypes {
    VerifyEmail = 'verify-email',
    ResetPassword = 'reset-password',
    SetPassword = 'set-password',
    AdminCredentials = 'admin-credentials',
}

export enum OtpType {
    ResetPassword = 'reset-password',
    VerifyEmail = 'verify-email',
    SetPassword = 'set-password',
}

export enum UserModel {
    User = 'user',
    Admin = 'admin',
}

export enum Role {
    Admin = 'admin',
    SuperAdmin = 'super-admin',
}
