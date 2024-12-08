import { Server } from '../../types';

export function isValidAuthorization(bearerToken: string): { token?: string; error?: string } {
    if (!bearerToken) return { error: 'Please specify authorization header' };
    const parts = bearerToken.split(' ');
    if (parts.length !== 2) return { error: 'Please specify correct authorization header' };
    const [scheme, token] = parts;
    if (!/Bearer/.test(scheme)) return { error: 'Please specify correct authorization header' };
    return { token };
}

export function middleware(_server: Server) {
    return {};
}
