import { auth } from '../lib';
import { Router } from '../types';

export function authHttpService() {
    function registerAuthRoutes(router: Router) {
        router.on(['GET', 'POST'], '/auth/*', (c) => {
            return auth.handler(c.req.raw);
        });
    }

    return { registerAuthRoutes };
}
