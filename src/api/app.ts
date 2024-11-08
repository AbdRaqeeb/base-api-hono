import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { createFactory } from 'hono/factory';

import { Env, Hono, Server } from '../types';
import { connection, createPgAdapter } from '../database';
import { createRepositories } from '../repositories';
import * as services from '../services';
import * as lib from '../lib';
import * as httpServices from '../api';
import project from '../project';
import { HttpStatusCode } from '../types/enums';
import { logRequestMiddleware } from '../log';

const startNewApplication = () => {
    const factory = createFactory<Env>();

    const app = new Hono<Env>();
    const router = new Hono<Env>();

    // set headers
    app.use(cors());

    // set request id
    app.use('*', requestId());

    // log request
    app.use(logRequestMiddleware());

    // parse json
    app.use(lib.bodyParser);

    app.get('/', (c) => {
        c.status(HttpStatusCode.Ok);
        return c.json({ message: `Welcome to ${project.name}` });
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
        userService: services.newUserService(repo.user, lib.passwordService),
        otpService: services.newOtpService(repo.otp),
        emailService: services.newEmailService(services.newEmailServiceStore()),
        adminService: services.newAdminService(repo.admin, lib.passwordService),
    };

    // mount routes
    httpServices.userHttpService(server).registerUserRoutes(router);
    httpServices.adminHttpService(server).registerAdminRoutes(router);

    app.route('/api', router);

    return server;
};
