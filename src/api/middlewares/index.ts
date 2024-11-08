import { Context, Next, Server } from '../../types';
import { errorResponse, tokenService } from '../../lib';
import { HttpStatusCode, Role } from '../../types/enums';
import logger from '../../log';

export function isValidAuthorization(bearerToken: string): { token?: string; error?: string } {
    if (!bearerToken) return { error: 'Please specify authorization header' };
    const parts = bearerToken.split(' ');
    if (parts.length !== 2) return { error: 'Please specify correct authorization header' };
    const [scheme, token] = parts;
    if (!/Bearer/.test(scheme)) return { error: 'Please specify correct authorization header' };
    return { token };
}

export function middleware(server: Server) {
    // Grant access to specific roles
    function authorizeAdminRole(roles: Role[]) {
        return server.factory.createMiddleware(async (context: Context, next: Next) => {
            const admin = context.var.admin;

            if (!roles.includes(admin.role)) {
                return errorResponse(
                    context,
                    HttpStatusCode.Forbidden,
                    `Admin role ${admin.role} is not authorized to access this route`
                );
            }

            await next();
        });
    }

    const isAuthenticatedUserJWT = server.factory.createMiddleware(async (context: Context, next: Next) => {
        try {
            const { error, token } = isValidAuthorization(context.req.header('Authorization'));
            if (error) {
                return errorResponse(context, HttpStatusCode.Unauthorized, error);
            }

            const { id } = tokenService.verify(token);

            const user = await server.userService.get({ id });

            if (!user) {
                return errorResponse(context, HttpStatusCode.Unauthorized, error);
            }

            context.set('user', user);

            await next();
        } catch (err) {
            logger.error(err, '[IsAuthenticatedUserJWT Error]');

            if (err.name === 'TokenExpiredError') {
                return errorResponse(context, HttpStatusCode.BadRequest, 'Token expired');
            }
            return errorResponse(context, HttpStatusCode.BadRequest, 'Not authorized to access this route');
        }
    });

    const isAuthenticatedAdminJWT = server.factory.createMiddleware(async (context: Context, next: Next) => {
        try {
            const { error, token } = isValidAuthorization(context.req.header('Authorization'));
            if (error) {
                return errorResponse(context, HttpStatusCode.Unauthorized, error);
            }

            const { id } = tokenService.verify(token);

            const admin = await server.adminService.get({ id });

            if (!admin) {
                return errorResponse(context, HttpStatusCode.Unauthorized, error);
            }

            context.set('admin', admin);

            await next();
        } catch (err) {
            logger.error(err, '[IsAuthenticatedAdminJWT Error]');

            if (err.name === 'TokenExpiredError') {
                return errorResponse(context, HttpStatusCode.BadRequest, 'Token expired');
            }

            return errorResponse(context, HttpStatusCode.BadRequest, 'Not authorized to access this route');
        }
    });

    return {
        isAuthenticatedUserJWT,
        isAuthenticatedAdminJWT,
        authorizeAdminRole,
    };
}
