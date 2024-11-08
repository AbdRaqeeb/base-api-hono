import { every } from 'hono/combine';
import { AdminResponse, OtpFilter, Server, Context, Router, ForgotPasswordSchema } from '../types';
import * as lib from '../lib';
import { passwordService } from '../lib';
import * as schema from '../lib/validations';
import { EmailClient, EmailTypes, HttpStatusCode, OtpType, Role, UserModel } from '../types/enums';
import logger from '../log';
import { NO_REPLY } from '../constants';
import { middleware } from './middlewares';

export function adminHttpService(server: Server) {
    const { isAuthenticatedAdminJWT, authorizeAdminRole } = middleware(server);

    function registerAdminRoutes(router: Router) {
        router.post('/auth/admin/new', every(isAuthenticatedAdminJWT, authorizeAdminRole([Role.SuperAdmin])), addAdmin);
        router.post('/auth/admin/login', login);
        router.post('/auth/admin/forgot-password', forgotPassword);
        router.post('/auth/admin/reset-password', resetPassword);
        router.post('/auth/admin/change-password', isAuthenticatedAdminJWT, changePassword);
    }

    async function addAdmin(context: Context): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.createAdminSchema, context.get('body'));
            if (error) return lib.errorResponse(context, HttpStatusCode.BadRequest, error);

            const foundAdmin = await server.adminService.check({
                email: value.email,
                username: value.username,
            });
            if (foundAdmin) {
                return lib.errorResponse(context, HttpStatusCode.BadRequest, 'Admin exists already');
            }

            const password = passwordService.generatePassword();

            const data = { ...value, password, role: value.role || Role.Admin };

            // create admin
            const admin = await server.adminService.add(data);

            sendNewAccountEmail(admin, password);

            return lib.successResponse(context, HttpStatusCode.Created, 'Admin added');
        } catch (error) {
            return lib.serverErrorResponse(context, '[AdminHttpService][AddAdmin]', error);
        }
    }

    async function login(context: Context): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.adminLoginSchema, context.get('body'));
            if (error) return lib.errorResponse(context, HttpStatusCode.BadRequest, error);

            const admin = await server.adminService.get(
                { email_or_username: value.email_or_username },
                { includePassword: true }
            );
            if (!admin) return lib.errorResponse(context, HttpStatusCode.BadRequest, 'Invalid email/password');

            if (!lib.passwordService.valid(value.password, admin.password)) {
                return lib.errorResponse(context, HttpStatusCode.BadRequest, 'Invalid email/password');
            }

            const result = generateToken(admin);

            return lib.successResponse(context, HttpStatusCode.Ok, 'Login Successful', result);
        } catch (error) {
            return lib.serverErrorResponse(context, '[AdminHttpService][Login]', error);
        }
    }

    async function forgotPassword(context: Context): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.forgotPasswordSchema, context.get('body'));
            if (error) return lib.errorResponse(context, HttpStatusCode.BadRequest, error);

            sendForgotPasswordEmail(value);

            return lib.successResponse(context, HttpStatusCode.Ok, 'Forgot password email sent');
        } catch (error) {
            return lib.serverErrorResponse(context, '[AdminHttpService][ForgotPassword]', error);
        }
    }

    async function resetPassword(context: Context): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.resetPasswordSchema, context.get('body'));
            if (error) return lib.errorResponse(context, HttpStatusCode.BadRequest, error);

            const filter = {
                model: UserModel.Admin,
                type: OtpType.ResetPassword,
                code: value.code,
            };

            const { error: passwordError } = await managePassword(filter, value.password);
            if (passwordError) return lib.errorResponse(context, HttpStatusCode.BadRequest, passwordError);

            return lib.successResponse(context, HttpStatusCode.Ok, 'Password has been reset');
        } catch (error) {
            return lib.serverErrorResponse(context, '[AdminHttpService][ForgotPassword]', error);
        }
    }

    /**
     * Handles the change password functionality for admin users.
     *
     * @param context - The HTTP context containing request and response information.
     * @returns A Promise that resolves to an HTTP response.
     *
     * @remarks
     * This function performs the following steps:
     * 1. Validates the request body using the `changePasswordSchema`.
     * 2. Retrieves the admin user from the database based on the admin ID stored in the request context.
     * 3. Checks if the provided current password matches the stored password.
     * 4. Updates the admin's password in the database.
     * 5. Returns a success response with a message indicating that the password has been changed.
     *
     * If any validation or database operation fails, an appropriate error response is returned.
     */
    async function changePassword(context: Context): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.changePasswordSchema, context.get('body'));
            if (error) return lib.errorResponse(context, HttpStatusCode.BadRequest, error);

            const admin = await server.adminService.get({ id: context.get('admin').id }, { includePassword: true });

            const isValidOldPassword = lib.passwordService.valid(value.password, admin.password);

            if (!isValidOldPassword) {
                return lib.errorResponse(context, HttpStatusCode.BadRequest, 'Invalid current password');
            }

            // update password
            await server.adminService.update(
                { id: context.get('admin').id },
                { password: value.new_password, is_newly_created: false }
            );

            return lib.successResponse(context, HttpStatusCode.Ok, 'Password changed');
        } catch (error) {
            return lib.serverErrorResponse(context, '[AdminHttpService][ForgotPassword]', error);
        }
    }

    /*
     * ---------------------------------------------------------------------------------------------------------
     * helper functions
     * ---------------------------------------------------------------------------------------------------------
     */

    async function sendOtp(admin: AdminResponse, type: OtpType, emailType: EmailTypes): Promise<void> {
        try {
            const otp = await server.otpService.add({
                type,
                model: UserModel.Admin,
                model_id: admin.id,
            });

            await server.emailService.sendEmailTemplate(
                {
                    from: {
                        email: NO_REPLY,
                        name: 'Alif Hub',
                    },
                    to: {
                        email: admin.email,
                        name: `${admin.first_name} ${admin.last_name}`,
                    },
                    templateData: {
                        otp: otp.code,
                    },
                    emailType,
                },
                EmailClient.Brevo
            );
        } catch (error) {
            logger.error(error, `[AdminHttpService][SendOtp] - sending admin ${type} otp error`);
        }
    }

    async function sendForgotPasswordEmail(value: ForgotPasswordSchema) {
        try {
            const foundAdmin = await server.adminService.get({ email: value.email });
            if (!foundAdmin) return;

            const otp = await server.otpService.add({
                model: UserModel.Admin,
                model_id: foundAdmin.id,
                type: OtpType.ResetPassword,
            });
            if (!otp) return;

            await sendOtp(foundAdmin, OtpType.ResetPassword, EmailTypes.ResetPassword);
        } catch (error) {
            logger.error(error, '[AdminHttpService][ForgotPassword]');
        }
    }

    async function sendNewAccountEmail(admin: AdminResponse, password: string): Promise<void> {
        try {
            await server.emailService.sendEmailTemplate(
                {
                    from: {
                        email: NO_REPLY,
                        name: 'Alif Hub',
                    },
                    to: {
                        email: admin.email,
                        name: `${admin.first_name} ${admin.last_name}`,
                    },
                    templateData: {
                        username: admin.username,
                        password,
                    },
                    emailType: EmailTypes.AdminCredentials,
                },
                EmailClient.Brevo
            );
        } catch (error) {
            logger.error(error, `[AdminHttpService][SendNewAccountEmail] - sending admin account email error`);
        }
    }

    async function managePassword(filter: OtpFilter, password: string): Promise<{ error?: string }> {
        try {
            const foundOtp = await server.otpService.get(filter);
            if (!foundOtp) {
                return { error: 'Invalid / expired otp' };
            }

            const foundAdmin = await server.adminService.get({ id: foundOtp.model_id });
            if (!foundAdmin) {
                return { error: 'Invalid / expired otp' };
            }

            // set password and delete otp
            await Promise.all([
                server.otpService.remove(filter),
                server.adminService.update({ id: foundOtp.model_id }, { password, is_newly_created: false }),
            ]);

            return {};
        } catch (error) {
            logger.error(error, '[AdminHttpService][ManagePassword]');
        }
    }

    function generateToken(admin: AdminResponse) {
        if (admin.password) {
            delete admin.password;
        }

        const token = lib.tokenService.issue({ id: admin.id, role: admin.role });
        const expiry = lib.tokenService.expiry(token);

        return { admin, token, expiry };
    }

    return { registerAdminRoutes };
}
