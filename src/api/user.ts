import { OtpFilter, Request, Response, Router, Server, UserResponse } from '../types';
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
        router.post('/auth/user/confirm-email', confirmEmail);
        router.post('/auth/user/forgot-password', forgotPassword);
        router.post('/auth/user/reset-password', resetPassword);
        router.post('/auth/user/set-password', setPassword);
        router.post('/auth/user/change-password', isAuthenticatedUserJWT, changePassword);
        router.post('/auth/user/confirm-email-otp', isAuthenticatedUserJWT, sendConfirmEmailOtp);
    }

    async function register(req: Request, res: Response): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.createUserSchema, req.body);
            if (error) return lib.errorResponse(res, HttpStatusCode.BadRequest, error);

            const foundUser = await server.userService.get({ email: value.email });
            if (foundUser) return lib.errorResponse(res, HttpStatusCode.BadRequest, 'User exists already');

            // create user
            const user = await server.userService.create(value);

            const result = generateToken(user);

            lib.successResponse(res, HttpStatusCode.Created, 'User registered', result);

            // send confirm email otp
            await sendOtp(user, OtpType.ConfirmEmail, EmailTypes.ConfirmEmail);
        } catch (error) {
            return lib.serverErrorResponse(res, '[UserHttpService][Register]', error);
        }
    }

    async function login(req: Request, res: Response): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.userLoginSchema, req.body);
            if (error) return lib.errorResponse(res, HttpStatusCode.BadRequest, error);

            const user = await server.userService.get({ email: value.email }, { includePassword: true });
            if (!user) return lib.errorResponse(res, HttpStatusCode.BadRequest, 'Invalid email/password');

            if (!user.has_password) {
                // send otp
                await sendOtp(user, OtpType.SetPassword, EmailTypes.SetPassword);

                return lib.errorResponse(res, HttpStatusCode.BadRequest, 'Set password to login');
            }

            if (!lib.passwordService.valid(value.password, user.password)) {
                return lib.errorResponse(res, HttpStatusCode.BadRequest, 'Invalid email/password');
            }

            const result = generateToken(user);

            return lib.successResponse(res, HttpStatusCode.Ok, 'Login Successful', result);
        } catch (error) {
            return lib.serverErrorResponse(res, '[UserHttpService][Login]', error);
        }
    }

    async function confirmEmail(req: Request, res: Response): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.confirmEmailSchema, req.body);
            if (error) return lib.errorResponse(res, HttpStatusCode.BadRequest, error);

            const filter = {
                model: UserModel.User,
                code: value.code,
                type: OtpType.ConfirmEmail,
            };

            const otp = await server.otpService.get(filter);
            if (!otp) {
                return lib.errorResponse(res, HttpStatusCode.BadRequest, 'Invalid otp');
            }

            // confirm email and delete otp
            await Promise.all([
                server.otpService.remove(filter),
                server.userService.update({ id: otp.model_id }, { is_email_confirmed: true }),
            ]);

            return lib.successResponse(res, HttpStatusCode.Ok, 'Email confirmed');
        } catch (error) {
            return lib.serverErrorResponse(res, '[UserHttpService][ConfirmEmail]', error);
        }
    }

    async function forgotPassword(req: Request, res: Response): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.forgotPasswordSchema, req.body);
            if (error) return lib.errorResponse(res, HttpStatusCode.BadRequest, error);

            lib.successResponse(res, HttpStatusCode.Ok, 'Forgot password email sent');

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
        } catch (error) {
            return lib.serverErrorResponse(res, '[UserHttpService][ForgotPassword]', error);
        }
    }

    async function resetPassword(req: Request, res: Response): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.resetPasswordSchema, req.body);
            if (error) return lib.errorResponse(res, HttpStatusCode.BadRequest, error);

            const filter = {
                model: UserModel.User,
                type: OtpType.ResetPassword,
                code: value.code,
            };

            const { error: passwordError } = await managePassword(filter, value.password);
            if (passwordError) return lib.errorResponse(res, HttpStatusCode.BadRequest, passwordError);

            return lib.successResponse(res, HttpStatusCode.Ok, 'Password has been reset');
        } catch (error) {
            return lib.serverErrorResponse(res, '[UserHttpService][ForgotPassword]', error);
        }
    }

    async function setPassword(req: Request, res: Response): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.setPasswordSchema, req.body);
            if (error) return lib.errorResponse(res, HttpStatusCode.BadRequest, error);

            const filter = {
                model: UserModel.User,
                type: OtpType.SetPassword,
                code: value.code,
            };

            const { error: passwordError } = await managePassword(filter, value.password);
            if (passwordError) return lib.errorResponse(res, HttpStatusCode.BadRequest, passwordError);

            return lib.successResponse(res, HttpStatusCode.Ok, 'Account password set');
        } catch (error) {
            return lib.serverErrorResponse(res, '[UserHttpService][ForgotPassword]', error);
        }
    }

    async function changePassword(req: Request, res: Response): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.changePasswordSchema, req.body);
            if (error) return lib.errorResponse(res, HttpStatusCode.BadRequest, error);

            const user = await server.userService.get({ id: req.user.id }, { includePassword: true });

            const isValidOldPassword = lib.passwordService.valid(value.password, user.password);

            if (!isValidOldPassword) {
                return lib.errorResponse(res, HttpStatusCode.BadRequest, 'Invalid current password');
            }

            // update password
            await server.userService.update({ id: req.user.id }, { password: value.new_password });

            return lib.successResponse(res, HttpStatusCode.Ok, 'Password changed');
        } catch (error) {
            return lib.serverErrorResponse(res, '[UserHttpService][ForgotPassword]', error);
        }
    }

    async function sendConfirmEmailOtp(req: Request, res: Response): Promise<Response> {
        try {
            if (req.user.is_email_confirmed) {
                return lib.errorResponse(res, HttpStatusCode.BadRequest, 'User email is confirmed');
            }

            // send email
            await sendOtp(req.user, OtpType.ConfirmEmail, EmailTypes.ConfirmEmail);

            return lib.successResponse(res, HttpStatusCode.Ok, 'Confirm email otp sent');
        } catch (error) {
            return lib.serverErrorResponse(res, '[UserHttpService][ForgotPassword]', error);
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
