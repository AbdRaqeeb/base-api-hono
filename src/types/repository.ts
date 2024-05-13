import * as types from '../types';

export interface Repository {
    user: types.UserRepository;
    otp: types.OtpRepository;
    admin: types.AdminRepository;
}
