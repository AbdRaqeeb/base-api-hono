import { cors } from 'hono/cors';
import { createFactory } from 'hono/factory';
import { requestId } from 'hono/request-id';

import * as httpServices from '../api';
import { connection, createPgAdapter } from '../database';
import { bodyParser, setHeaders } from '../lib';
import { logRequestMiddleware } from '../log';
import project from '../project';
import { createRepositories } from '../repositories';
import * as services from '../services';
import { Env, Hono, Server } from '../types';
import { HttpStatusCode } from '../types/enums';

const startNewApplication = () => {
    const factory = createFactory<Env>();

    const app = new Hono<Env>();
    const router = new Hono<Env>();

    // set headers
    app.use(
        cors({
            origin: '*',
            allowHeaders: ['Accept', 'Content-Length', 'Content-Type', 'Authorization'],
            allowMethods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
            maxAge: 3600,
        })
    );
    router.use(
        cors({
            origin: '*',
            allowHeaders: ['Accept', 'Content-Length', 'Content-Type', 'Authorization'],
            allowMethods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
            maxAge: 3600,
        })
    );

    // set headers
    app.use(setHeaders);
    router.use(setHeaders);

    // set request id
    app.use('*', requestId());

    // parse json
    app.use(bodyParser);

    // log request
    app.use(logRequestMiddleware());

    app.get('/', (context) => {
        context.status(HttpStatusCode.Ok);
        return context.json({ message: `Welcome to ${project.name}` });
    });

    return { app, factory, router };
};

export const createNewServer = (): Server => {
    const { app, factory, router } = startNewApplication();
    const DB = createPgAdapter(connection);
    const repo = createRepositories(DB);

    const server: Server = {
        app,
        factory,
        userService: services.newUserService(repo.user),
        emailService: services.emailService,
    };

    // mount routes
    httpServices.authHttpService().registerAuthRoutes(router);

    app.route('/api', router);

    return server;
};
