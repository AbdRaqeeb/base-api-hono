import { Hono } from 'hono';
import type { Context, Next } from 'hono';
import { Factory } from 'hono/factory';
import * as types from '../types';

type Env = {
    Variables: {
        user: types.UserResponse;
        admin: types.AdminResponse;
    };
};

type App = Hono<Env>;
type Router = Hono<Env>;

export interface Server {
    app: App;
    factory: Factory<Env>;
    userService: types.UserService;
    otpService: types.OtpService;
    emailService: types.EmailService;
    adminService: types.AdminService;
}

export { Server as HttpServer } from 'http';
export { Hono, Next, Context, Env, Router, App };
