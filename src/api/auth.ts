import { Context } from 'hono';
import { auth } from '../lib';
import { Router } from '../types';

export function authHttpService() {
    function registerAuthRoutes(router: Router) {
        router.post('/auth/**', handler);
        router.get('/auth/**', handler);
    }

    function handler(context: Context) {
        return auth.handler(context.req.raw);
    }

    return { registerAuthRoutes };
}
