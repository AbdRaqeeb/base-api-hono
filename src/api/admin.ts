import { AdminResponse, OtpFilter, Request, Response, Router, Server } from '../types';
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
        router.post('/auth/admin/new', [isAuthenticatedAdminJWT, authorizeAdminRole([Role.SuperAdmin])], addAdmin);
        router.post('/auth/admin/login', login);
        router.post('/auth/admin/forgot-password', forgotPassword);
        router.post('/auth/admin/reset-password', resetPassword);
        router.post('/auth/admin/change-password', isAuthenticatedAdminJWT, changePassword);
    }

    async function addAdmin(req: Request, res: Response): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.createAdminSchema, req.body);
            if (error) return lib.errorResponse(res, HttpStatusCode.BadRequest, error);

            const foundAdmin = await server.adminService.check({
                email: value.email,
                username: value.username,
            });
            if (foundAdmin) return lib.errorResponse(res, HttpStatusCode.BadRequest, 'Admin exists already');

            const password = passwordService.generatePassword();

            const data = { ...value, password, role: value.role || Role.Admin };

            // create admin
            const admin = await server.adminService.add(data);

            lib.successResponse(res, HttpStatusCode.Created, 'Admin added');

            // send new admin account email
            await sendNewAccountEmail(admin, password);
        } catch (error) {
            return lib.serverErrorResponse(res, '[AdminHttpService][AddAdmin]', error);
        }
    }

    async function login(req: Request, res: Response): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.adminLoginSchema, req.body);
            if (error) return lib.errorResponse(res, HttpStatusCode.BadRequest, error);

            const admin = await server.adminService.get(
                { email_or_username: value.email_or_username },
                { includePassword: true }
            );
            if (!admin) return lib.errorResponse(res, HttpStatusCode.BadRequest, 'Invalid email/password');

            if (!lib.passwordService.valid(value.password, admin.password)) {
                return lib.errorResponse(res, HttpStatusCode.BadRequest, 'Invalid email/password');
            }

            const result = generateToken(admin);

            return lib.successResponse(res, HttpStatusCode.Ok, 'Login Successful', result);
        } catch (error) {
            return lib.serverErrorResponse(res, '[AdminHttpService][Login]', error);
        }
    }

    async function forgotPassword(req: Request, res: Response): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.forgotPasswordSchema, req.body);
            if (error) return lib.errorResponse(res, HttpStatusCode.BadRequest, error);

            lib.successResponse(res, HttpStatusCode.Ok, 'Forgot password email sent');

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
        } catch (error) {
            return lib.serverErrorResponse(res, '[AdminHttpService][ForgotPassword]', error);
        }
    }

    async function resetPassword(req: Request, res: Response): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.resetPasswordSchema, req.body);
            if (error) return lib.errorResponse(res, HttpStatusCode.BadRequest, error);

            const filter = {
                model: UserModel.Admin,
                type: OtpType.ResetPassword,
                code: value.code,
            };

            const { error: passwordError } = await managePassword(filter, value.password);
            if (passwordError) return lib.errorResponse(res, HttpStatusCode.BadRequest, passwordError);

            return lib.successResponse(res, HttpStatusCode.Ok, 'Password has been reset');
        } catch (error) {
            return lib.serverErrorResponse(res, '[AdminHttpService][ForgotPassword]', error);
        }
    }

    async function changePassword(req: Request, res: Response): Promise<Response> {
        try {
            const { error, value } = lib.validateSchema(schema.changePasswordSchema, req.body);
            if (error) return lib.errorResponse(res, HttpStatusCode.BadRequest, error);

            const admin = await server.adminService.get({ id: req.admin.id }, { includePassword: true });

            const isValidOldPassword = lib.passwordService.valid(value.password, admin.password);

            if (!isValidOldPassword) {
                return lib.errorResponse(res, HttpStatusCode.BadRequest, 'Invalid current password');
            }

            // update password
            await server.adminService.update(
                { id: req.admin.id },
                { password: value.new_password, is_newly_created: false }
            );

            return lib.successResponse(res, HttpStatusCode.Ok, 'Password changed');
        } catch (error) {
            return lib.serverErrorResponse(res, '[AdminHttpService][ForgotPassword]', error);
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
