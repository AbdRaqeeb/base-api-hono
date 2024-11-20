import { createNewServer } from '../../src/api';
import { UnknownObject } from '../../src/types';

interface RequestParams {
    method: string;
    url: string;
    body?: UnknownObject;
    token?: string;
    customHeaders?: UnknownObject;
}

function buildTestServer() {
    const { app } = createNewServer();

    async function request({ method, url, body, token, customHeaders }: RequestParams) {
        const headerParams: UnknownObject = {
            'Content-Type': 'application/json',
            ...customHeaders,
        };
        if (token) headerParams['Authorization'] = `Bearer ${token}`;

        const headers = new Headers(headerParams);

        const options: RequestInit = { method, headers };
        if (body) options.body = JSON.stringify(body);

        return app.request(url, options);
    }

    async function post(url: string, body?: UnknownObject, token?: string, customHeaders?: UnknownObject) {
        return request({ method: 'POST', url, body, token, customHeaders });
    }

    async function put(url: string, body?: UnknownObject, token?: string, customHeaders?: UnknownObject) {
        return request({ method: 'PUT', url, body, token, customHeaders });
    }

    async function get(url: string, token?: string, customHeaders?: UnknownObject) {
        return request({ method: 'GET', url, token, customHeaders });
    }

    async function deleteRequest(url: string, token?: string, customHeaders?: UnknownObject) {
        return request({ method: 'DELETE', url, token, customHeaders });
    }

    return { post, put, get, delete: deleteRequest };
}

export const server = buildTestServer();
