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

export enum EmailClient {
    Resend = 'resend',
    Sendgrid = 'sendgrid',
    Brevo = 'brevo',
    Nodemailer = 'nodemailer',
}

export enum EmailTypes {
    WelcomeEmail = 'welcome-email',
    VerifyEmail = 'verify-email',
    ForgotPassword = 'forgot-password',
    SignInOtp = 'sign-in-otp',
}
