import { Router } from '../types';
import { auth } from '../lib';
import { Context } from 'hono';

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
