import express, { Application, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import * as types from '../types';

export interface Request extends ExpressRequest {
    request_id: string;
    user: types.UserResponse;
    admin: types.AdminResponse;
}

export interface Response extends ExpressResponse {
    request_id: string;
}

export interface Server {
    app: Application;
    userService: types.UserService;
    otpService: types.OtpService;
    emailService: types.EmailService;
    adminService: types.AdminService;
}

export { Router, NextFunction, Application } from 'express';
export { Server as HttpServer } from 'http';
export { express };
