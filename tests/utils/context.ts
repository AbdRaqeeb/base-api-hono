import { generateId } from '../../src/lib';
import { Context, UnknownObject } from '../../src/types';

type ContextParams = {
    route?: string;
    url?: string;
    query?: UnknownObject;
    params?: UnknownObject;
    headers?: UnknownObject;
    body?: UnknownObject;
    request_id?: string;
};

export default class MockContext {
    route = 'test';
    url = '/test';
    query = {};
    params = {};
    headers = {};
    statusCode: number;
    method = 'GET';
    request_id = generateId();
    body = {};

    constructor({ route, url, query, params, headers }: ContextParams = {}) {
        this.route = route;
        this.url = url;
        this.query = query;
        this.params = params;
        this.headers = headers;
    }

    req = {
        route: this.route,
        url: this.url,
        query: () => this.query,
        param: () => this.params,
        header: () => this.headers,
        json: this.json,
        body: () => this.body,
    };

    status(status: number) {
        this.statusCode = status;

        return this;
    }

    json(data: Record<string, unknown>) {
        return data;
    }

    get(key: string) {
        if (key === 'requestId') {
            return this.request_id;
        }
        return generateId();
    }
}

export function getContext(payload: ContextParams = {}) {
    return new MockContext(payload) as unknown as Context;
}
