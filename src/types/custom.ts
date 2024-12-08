export type PaginationParam = {
    page?: string;
    size?: string;
};

export interface PaginationResponse<T> {
    data: T[];
    pagination: {
        next?: {
            page: number;
            size: number;
        };
        previous?: {
            page: number;
            size: number;
        };
        current_page?: number;
        size: number;
        total: number;
    };
}

export interface RangeFilter {
    search?: string;
    from?: string;
    to?: string;
}

export type CalculatedPaginationData = {
    page: number;
    size: number;
    startIndex: number;
    endIndex: number;
};

export type UnknownObject = Record<string, any>;

export type PasswordService = {
    generatePassword(): string;
};

export type ForgotPasswordSchema = {
    email: string;
};

export type ResetPasswordSchema = {
    code: string;
    password: string;
};

export type SetPasswordSchema = {
    code: string;
    password: string;
};

export type VerifyEmailSchema = {
    code: string;
};

export type ChangePasswordSchema = {
    password: string;
    new_password: string;
};
