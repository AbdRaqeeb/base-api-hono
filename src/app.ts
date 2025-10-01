import { cors } from 'hono/cors';
import { showRoutes } from 'hono/dev';
import { createFactory } from 'hono/factory';
import { requestId } from 'hono/request-id';
import { serveStatic } from 'hono/bun';
import { basicAuth } from 'hono/basic-auth';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { createBullBoard } from '@bull-board/api';
import { HonoAdapter } from '@bull-board/hono';

import * as httpServices from './api';
import { bullRedis, connection, createPgAdapter, redis } from './database';
import { apiRateLimiter, bodyParser, setHeaders } from './lib';
import { logRequestMiddleware } from './log';
import project from './project';
import { createRepositories } from './repositories';
import * as services from './services';
import { App, AppWorker, Env, Hono, Server } from './types';
import { HttpStatusCode } from './types/enums';
import Config from './config';
import { newAppWorker, newWorkerService } from './workers';

function startNewApplication() {
    const factory = createFactory<Env>();

    const app = new Hono<Env>();
    const router = new Hono<Env>();
    const ui = new Hono<Env>();

    const trustedOrigins = [
        ...Config.trustedOrigins,
        'https://accounts.google.com',
        'http://localhost:3000',
        'http://localhost:3478',
    ];

    // General CORS configuration for other routes
    const generalCorsMiddleware = cors({
        origin: (origin, _context) => {
            if (!origin) return '*';
            return trustedOrigins.includes(origin) ? origin : '*';
        },
        allowHeaders: ['Accept', 'Content-Length', 'Content-Type', 'Authorization', 'Last-Event-ID'],
        allowMethods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        maxAge: 86400,
        credentials: true,
    });

    app.use(generalCorsMiddleware);

    // Rest of your middleware
    app.use(setHeaders);
    router.use(setHeaders);
    ui.use(setHeaders);

    // set request id
    app.use('*', requestId());

    // parse json
    app.use(bodyParser);

    // log request
    app.use(logRequestMiddleware());
    router.use(logRequestMiddleware());
    ui.use(logRequestMiddleware());

    // set rate limit
    app.use(apiRateLimiter);
    router.use(apiRateLimiter);
    ui.use(apiRateLimiter);

    // Apply the same middleware pattern to router
    router.use(generalCorsMiddleware);
    ui.use(generalCorsMiddleware);

    app.get('/', (context) => {
        context.status(HttpStatusCode.Ok);
        return context.json({ message: `Welcome to ${project.name}` });
    });

    return { app, factory, router, ui };
}

interface AppResult {
    server: Server;
    worker: AppWorker;
    app: App;
}

export function createApplication(): AppResult {
    const { app, factory, router } = startNewApplication();
    const DB = createPgAdapter(connection);
    const repo = createRepositories(DB);

    const server: Server = {
        app,
        repo,
        factory,
        queue: services.queue,
        cache: services.createCacheService(redis, repo),
        userService: services.newUserService(repo.user),
        emailService: services.emailService,
    };

    const workerService = newWorkerService({ server });
    const worker = newAppWorker({ connection: bullRedis, workerService });

    // mount routes
    httpServices.authHttpService().registerAuthRoutes(router);
    httpServices.usernameHttpService(server).registerUsernameRoutes(router);

    const uiBasePath = '/processor';
    const serverAdapter = new HonoAdapter(serveStatic);
    serverAdapter.setBasePath(uiBasePath);

    const bullBoardQueues = [new BullMQAdapter(server.queue.email, { allowRetries: true, displayName: 'Email Queue' })];

    createBullBoard({ queues: bullBoardQueues, serverAdapter, options: { uiConfig: project.board } });

    app.use(uiBasePath + '/*', basicAuth(Config.auth));
    app.route(uiBasePath, serverAdapter.registerPlugin());
    app.use('/static/*', serveStatic({ root: './' }));
    app.use('/favicon.ico', serveStatic({ path: './favicon.ico' }));

    app.route('/api', router);

    showRoutes(app);

    return { server, worker, app };
}
