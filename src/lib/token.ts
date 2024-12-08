import { JwtPayload, verify as jwtVerify, sign } from 'jsonwebtoken';
import Config from '../config';

interface TokenService {
    issue(payload: JwtPayload, expiry?: string): string;
    verify(token: string): JwtPayload;
    expiry(token: string): number | null;
}

function newTokenService(): TokenService {
    function issue(payload: JwtPayload, expiry = Config.jwtExpiry) {
        return sign(payload, Config.jwtSecret, { expiresIn: expiry, notBefore: 0 });
    }

    function verify(token: string): JwtPayload {
        return jwtVerify(token, Config.jwtSecret) as JwtPayload;
    }

    function expiry(token: string): number | null {
        const payload = jwtVerify(token, Config.jwtSecret) as JwtPayload;
        return payload?.exp || null;
    }

    return { issue, verify, expiry };
}

export const tokenService = newTokenService();
