import { Context } from 'hono';
import { errorResponse, serverErrorResponse, successResponse } from '../lib';
import { Router, Server } from '../types';
import { HttpStatusCode } from '../types/enums';

export function usernameHttpService(server: Server) {
    function registerUsernameRoutes(router: Router) {
        router.get('/usernames', checkUsername);
    }

    async function checkUsername(context: Context) {
        try {
            const username = context.req.query('username') as string;
            if (!username) return errorResponse(context, HttpStatusCode.BadRequest, 'Username is required');

            const usernameExists = await server.cache.username.exist(username);
            const response = { available: !usernameExists };

            return successResponse(context, HttpStatusCode.Ok, 'Username searched', response);
        } catch (error) {
            return serverErrorResponse(context, '[UsernameHttpService][CheckUsername]', error);
        }
    }

    return { registerUsernameRoutes };
}
