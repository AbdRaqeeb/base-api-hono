import { Application, express, NextFunction, Request, Response, Server } from '../types';
import Config from '../config';
import { logRequestMiddleware } from '../log';
import { connection, createPgAdapter } from '../database';
import { createRepositories } from '../repositories';
import * as services from '../services';
import * as lib from '../lib';
import * as httpServices from '../api';
import project from '../project';

const startNewApplication = (): Application => {
    const app = express();

    app.set('port', Config.port);

    // parse request body
    app.use(express.json());

    // parse query string using querystring library
    app.use(express.urlencoded({ extended: false }));

    // set headers
    app.use((req: Request, res: Response, next: NextFunction) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Accept, Content-Length, Content-Type, Authorization');
        next();
    });

    // log request
    app.use(logRequestMiddleware());

    app.get('/', (req: Request, res: Response) => {
        return res.status(200).json({ message: `Welcome to ${project.name}` });
    });

    return app;
};

export const createNewServer = (): Server => {
    const app = startNewApplication();
    const DB = createPgAdapter(connection);
    const repo = createRepositories(DB);

    const server: Server = {
        app,
        userService: services.newUserService(repo.user, lib.passwordService),
        otpService: services.newOtpService(repo.otp),
        emailService: services.newEmailService(services.newEmailServiceStore()),
        adminService: services.newAdminService(repo.admin, lib.passwordService),
    };

    // create the express router
    const router = express.Router();

    // mount routes
    httpServices.userHttpService(server).registerUserRoutes(router);
    httpServices.adminHttpService(server).registerAdminRoutes(router);

    app.use('/api', router);

    return server;
};
