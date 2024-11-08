import { OtpFilter, Router, Server, UserResponse, Context, ForgotPasswordSchema } from '../types';
import * as lib from '../lib';
import * as schema from '../lib/validations';
import { EmailClient, EmailTypes, HttpStatusCode, OtpType, UserModel } from '../types/enums';
import logger from '../log';
import { NO_REPLY } from '../constants';
import { middleware } from './middlewares';

export function userHttpService(server: Server) {
    const { isAuthenticatedUserJWT } = middleware(server);

    function registerUserRoutes(router: Router) {
        router.post('/auth/user/register', register);
        router.post('/auth/user/login', login);
        router.post('/auth/user/verify-email', verifyEmail);
        router.post('/auth/user/forgot-password', forgotPassword);
        router.post('/auth/user/reset-password', resetPassword);
        router.post('/auth/user/set-password', setPassword);
        router.post('/auth/user/change-password', isAuthenticatedUserJWT, changePassword);
        router.post('/auth/user/verify-email-otp', isAuthenticatedUserJWT, sendVerifyEmailOtp);
    }

    /**
     * Registers a new user in the system.
     *
     * This function validates the input, checks for existing users, creates a new user,
     * generates an authentication token, and sends a verification email.
     *
     * @param context - The context object containing request details and body.
     * @returns A Promise that resolves to a Response object.
     *          If successful, it returns a success response with the created user and token.
     *          If there's an error, it returns an appropriate error response.
     */
    async function register(context: Context): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.createUserSchema, context.get('body'));
            if (error) return lib.errorResponse(context, HttpStatusCode.BadRequest, error);

            const foundUser = await server.userService.get({ email: value.email });
            if (foundUser) return lib.errorResponse(context, HttpStatusCode.BadRequest, 'User exists already');

            // create user
            const user = await server.userService.create(value);

            const result = generateToken(user);

            sendOtp(user, OtpType.VerifyEmail, EmailTypes.VerifyEmail);

            return lib.successResponse(context, HttpStatusCode.Created, 'User registered', result);
        } catch (error) {
            return lib.serverErrorResponse(context, '[UserHttpService][Register]', error);
        }
    }

    async function login(context: Context): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.userLoginSchema, context.get('body'));
            if (error) return lib.errorResponse(context, HttpStatusCode.BadRequest, error);

            const user = await server.userService.get({ email: value.email }, { includePassword: true });
            if (!user) return lib.errorResponse(context, HttpStatusCode.BadRequest, 'Invalid email/password');

            if (!user.has_password) {
                // send otp
                await sendOtp(user, OtpType.SetPassword, EmailTypes.SetPassword);

                return lib.errorResponse(context, HttpStatusCode.BadRequest, 'Set password to login');
            }

            if (!lib.passwordService.valid(value.password, user.password)) {
                return lib.errorResponse(context, HttpStatusCode.BadRequest, 'Invalid email/password');
            }

            const result = generateToken(user);

            return lib.successResponse(context, HttpStatusCode.Ok, 'Login Successful', result);
        } catch (error) {
            return lib.serverErrorResponse(context, '[UserHttpService][Login]', error);
        }
    }

    async function verifyEmail(context: Context): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.verifyEmailSchema, context.get('body'));
            if (error) return lib.errorResponse(context, HttpStatusCode.BadRequest, error);

            const filter = {
                model: UserModel.User,
                code: value.code,
                type: OtpType.VerifyEmail,
            };

            const otp = await server.otpService.get(filter);
            if (!otp) {
                return lib.errorResponse(context, HttpStatusCode.BadRequest, 'Invalid otp');
            }

            // verify email and delete otp
            await Promise.all([
                server.otpService.remove(filter),
                server.userService.update({ id: otp.model_id }, { is_email_verified: true }),
            ]);

            return lib.successResponse(context, HttpStatusCode.Ok, 'Email verified');
        } catch (error) {
            return lib.serverErrorResponse(context, '[UserHttpService][VerifyEmail]', error);
        }
    }

    async function forgotPassword(context: Context): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.forgotPasswordSchema, context.get('body'));
            if (error) return lib.errorResponse(context, HttpStatusCode.BadRequest, error);

            sendForgetPassword(value);

            return lib.successResponse(context, HttpStatusCode.Ok, 'Forgot password email sent');
        } catch (error) {
            return lib.serverErrorResponse(context, '[UserHttpService][ForgotPassword]', error);
        }
    }

    async function resetPassword(context: Context): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.resetPasswordSchema, context.get('body'));
            if (error) return lib.errorResponse(context, HttpStatusCode.BadRequest, error);

            const filter = {
                model: UserModel.User,
                type: OtpType.ResetPassword,
                code: value.code,
            };

            const { error: passwordError } = await managePassword(filter, value.password);
            if (passwordError) return lib.errorResponse(context, HttpStatusCode.BadRequest, passwordError);

            return lib.successResponse(context, HttpStatusCode.Ok, 'Password has been reset');
        } catch (error) {
            return lib.serverErrorResponse(context, '[UserHttpService][ForgotPassword]', error);
        }
    }

    async function setPassword(context: Context): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.setPasswordSchema, context.get('body'));
            if (error) return lib.errorResponse(context, HttpStatusCode.BadRequest, error);

            const filter = {
                model: UserModel.User,
                type: OtpType.SetPassword,
                code: value.code,
            };

            const { error: passwordError } = await managePassword(filter, value.password);
            if (passwordError) return lib.errorResponse(context, HttpStatusCode.BadRequest, passwordError);

            return lib.successResponse(context, HttpStatusCode.Ok, 'Account password set');
        } catch (error) {
            return lib.serverErrorResponse(context, '[UserHttpService][ForgotPassword]', error);
        }
    }

    async function changePassword(context: Context): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.changePasswordSchema, context.get('body'));
            if (error) return lib.errorResponse(context, HttpStatusCode.BadRequest, error);

            const user = await server.userService.get({ id: context.get('user').id }, { includePassword: true });

            const isValidOldPassword = lib.passwordService.valid(value.password, user.password);

            if (!isValidOldPassword) {
                return lib.errorResponse(context, HttpStatusCode.BadRequest, 'Invalid current password');
            }

            // update password
            await server.userService.update({ id: context.get('user').id }, { password: value.new_password });

            return lib.successResponse(context, HttpStatusCode.Ok, 'Password changed');
        } catch (error) {
            return lib.serverErrorResponse(context, '[UserHttpService][ForgotPassword]', error);
        }
    }

    async function sendVerifyEmailOtp(context: Context): Promise<Response> {
        try {
            if (context.get('user').is_email_verified) {
                return lib.errorResponse(context, HttpStatusCode.BadRequest, 'User email is verified');
            }

            // send email
            await sendOtp(context.get('user'), OtpType.VerifyEmail, EmailTypes.VerifyEmail);

            return lib.successResponse(context, HttpStatusCode.Ok, 'Verify email otp sent');
        } catch (error) {
            return lib.serverErrorResponse(context, '[UserHttpService][ForgotPassword]', error);
        }
    }

    /*
     * ---------------------------------------------------------------------------------------------------------
     * helper functions
     * ---------------------------------------------------------------------------------------------------------
     */

    async function sendOtp(user: UserResponse, type: OtpType, emailType: EmailTypes): Promise<void> {
        try {
            const otp = await server.otpService.add({
                type,
                model: UserModel.User,
                model_id: user.id,
            });

            await server.emailService.sendEmailTemplate(
                {
                    from: {
                        email: NO_REPLY,
                        name: 'Alif Hub',
                    },
                    to: {
                        email: user.email,
                        name: `${user.first_name} ${user.last_name}`,
                    },
                    templateData: {
                        otp: otp.code,
                    },
                    emailType,
                },
                EmailClient.Brevo
            );
        } catch (error) {
            logger.error(error, `[UserHttpService][SendOtp] - sending user ${type} otp error`);
        }
    }

    async function sendForgetPassword(value: ForgotPasswordSchema) {
        try {
            const foundUser = await server.userService.get({ email: value.email });
            if (!foundUser) return;

            const otp = await server.otpService.add({
                model: UserModel.User,
                model_id: foundUser.id,
                type: OtpType.ResetPassword,
            });
            if (!otp) return;

            await sendOtp(foundUser, OtpType.ResetPassword, EmailTypes.ResetPassword);
        } catch (error) {
            logger.error(error, '[UserHttpService][ForgotPassword]');
        }
    }

    async function managePassword(filter: OtpFilter, password: string): Promise<{ error?: string }> {
        try {
            const foundOtp = await server.otpService.get(filter);
            if (!foundOtp) {
                return { error: 'Invalid / expired otp' };
            }

            const foundUser = await server.userService.get({ id: foundOtp.model_id });
            if (!foundUser) {
                return { error: 'Invalid / expired otp' };
            }

            // set password and delete otp
            await Promise.all([
                server.otpService.remove(filter),
                server.userService.update({ id: foundOtp.model_id }, { password }),
            ]);

            return {};
        } catch (error) {
            logger.error(error, `[UserHttpService][ManagePassword]`);
        }
    }

    function generateToken(user: UserResponse) {
        if (user.password) {
            delete user.password;
        }

        const token = lib.tokenService.issue({ id: user.id, role: UserModel.User });
        const expiry = lib.tokenService.expiry(token);

        return { user, token, expiry };
    }

    return { registerUserRoutes };
}
