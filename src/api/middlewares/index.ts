import { NextFunction, Request, Response, Server } from '../../types';
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
    async function isAuthenticatedUserJWT(req: Request, res: Response, next: NextFunction) {
        try {
            const { error, token } = isValidAuthorization(req.headers.authorization);
            if (error) {
                return errorResponse(res, HttpStatusCode.Unauthorized, error);
            }

            const { id } = tokenService.verify(token);

            const user = await server.userService.get({ id });

            if (!user) {
                return errorResponse(res, HttpStatusCode.Unauthorized, error);
            }

            req.user = user;

            return next();
        } catch (err) {
            logger.error(err, '[IsAuthenticatedUserJWT Error]');

            if (err.name === 'TokenExpiredError') {
                return errorResponse(res, HttpStatusCode.BadRequest, 'Token expired');
            }

            return errorResponse(res, HttpStatusCode.BadRequest, 'Not authorized to access this route');
        }
    }

    async function isAuthenticatedAdminJWT(req: Request, res: Response, next: NextFunction) {
        try {
            const { error, token } = isValidAuthorization(req.headers.authorization);
            if (error) {
                return errorResponse(res, HttpStatusCode.Unauthorized, error);
            }

            const { id } = tokenService.verify(token);

            const admin = await server.adminService.get({ id });

            if (!admin) {
                return errorResponse(res, HttpStatusCode.Unauthorized, error);
            }

            req.admin = admin;

            return next();
        } catch (err) {
            logger.error(err, '[IsAuthenticatedAdminJWT Error]');

            if (err.name === 'TokenExpiredError') {
                return errorResponse(res, HttpStatusCode.BadRequest, 'Token expired');
            }

            return errorResponse(res, HttpStatusCode.BadRequest, 'Not authorized to access this route');
        }
    }

    // Grant access to specific roles
    function authorizeAdminRole(roles: Role[]) {
        return (req: Request, res: Response, next: NextFunction) => {
            if (!roles.includes(req.admin.role)) {
                return errorResponse(
                    res,
                    HttpStatusCode.Forbidden,
                    `Admin role ${req.admin.role} is not authorized to access this route`
                );
            }
            next();
        };
    }

    return {
        isAuthenticatedUserJWT,
        isAuthenticatedAdminJWT,
        authorizeAdminRole,
    };
}
