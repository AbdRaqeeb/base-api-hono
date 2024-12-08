type Method = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';

interface RequestConfig {
    url?: string;
    method?: Method;
    headers?: Record<string, string>;
    data?: any;
    params?: Record<string, string>;
    timeout?: number;
    baseURL?: string;
}

interface CustomResponse<T = any> extends Response {
    data: T;
    status: number;
    statusText: string;
    headers: Headers;
    config: RequestConfig;
}

type CustomRequestInit = RequestInit & {
    verbose?: boolean;
};

function createRequestFn(defaultConfig: RequestConfig = {}) {
    function buildURL(config: RequestConfig): string {
        const baseURL = config.baseURL || defaultConfig.baseURL || '';
        const url = config.url || '';
        const fullURL = baseURL ? new URL(url, baseURL).toString() : url;

        if (config.params) {
            const searchParams = new URLSearchParams(config.params);
            return `${fullURL}${fullURL.includes('?') ? '&' : '?'}${searchParams}`;
        }

        return fullURL;
    }

    function createRequestInit(config: RequestConfig): RequestInit {
        const headers = {
            'Content-Type': 'application/json',
            ...defaultConfig.headers,
            ...config.headers,
        };

        const init: CustomRequestInit = {
            method: config.method?.toUpperCase() || 'GET',
            headers,
            verbose: process.env.BUN_CONFIG_VERBOSE_FETCH === '1',
        };

        if (config.data) {
            init.body = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
        }

        if (config.timeout) {
            init.signal = AbortSignal.timeout(config.timeout);
        }

        return init;
    }

    async function parseResponse<T>(response: CustomResponse): Promise<T> {
        const contentType = response.headers.get('content-type');

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        if (contentType?.includes('application/json')) {
            return response.json() as T;
        }

        return response.text() as unknown as T;
    }

    const createError = (error: any, config: RequestConfig) => ({
        message: error.message,
        config,
        isAxiosError: true,
        name: error.name,
        stack: error.stack,
    });

    async function request<T = any>(config: RequestConfig): Promise<CustomResponse<T>> {
        // Disable Bun logging
        process.env.BUN_SEND_PROGRESS = '0';
        process.env.BUN_SHOW_DOWNLOAD_PROGRESS = '0';

        try {
            const url = buildURL(config);
            const init = createRequestInit(config);

            const response = (await fetch(url, init)) as CustomResponse;
            const responseData = await parseResponse<T>(response);

            return {
                data: responseData,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                config,
            } as CustomResponse;
        } catch (error) {
            throw createError(error, config);
        } finally {
            // Reset Bun logging
            process.env.BUN_SEND_PROGRESS = '1';
            process.env.BUN_SHOW_DOWNLOAD_PROGRESS = '1';
        }
    }

    // Method shortcuts
    function get<T = any>(url: string, config: RequestConfig = {}) {
        return request<T>({ ...config, method: 'get', url });
    }

    function post<T = any>(url: string, data?: any, config: RequestConfig = {}) {
        return request<T>({ ...config, method: 'post', url, data });
    }

    function put<T = any>(url: string, data?: any, config: RequestConfig = {}) {
        return request<T>({ ...config, method: 'put', url, data });
    }

    function del<T = any>(url: string, config: RequestConfig = {}) {
        return request<T>({ ...config, method: 'delete', url });
    }

    function patch<T = any>(url: string, data?: any, config: RequestConfig = {}) {
        return request<T>({ ...config, method: 'patch', url, data });
    }

    return { request, get, post, put, delete: del, patch };
}

// Create default instance
const request = createRequestFn();

// Export default instance and factory function
export default request;
export const create = createRequestFn;
