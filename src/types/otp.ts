import { OtpType, UserModel } from './enums';

export interface Otp {
    id: number;
    code: string;
    expires_at: number;
    type: OtpType;
    model: UserModel;
    model_id: number;
    created_at: Date;
}

export interface OtpCreate {
    type: OtpType;
    model: UserModel;
    model_id: number;
}

export interface OtpFilter {
    code?: string;
    type: OtpType;
    model: UserModel;
    model_id?: number;
}

export interface OtpRepository {
    create: (data: OtpCreate) => Promise<Otp>;
    get: (data: OtpFilter) => Promise<Otp>;
    remove: (data: OtpFilter) => Promise<void>;
}

export type OtpResponse = Otp;

export type OtpCode = {
    code: string;
};

export interface OtpService {
    add: (data: OtpCreate) => Promise<OtpCode>;
    get: (filter: OtpFilter) => Promise<OtpResponse>;
    remove: (filter: OtpFilter) => Promise<void>;
}
