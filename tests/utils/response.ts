import { generateId } from '../../src/lib';

export default class Response {
    statusCode: number;
    request_id = generateId();

    status(status: number) {
        this.statusCode = status;

        return this;
    }

    json(data: Record<string, unknown>) {
        return data;
    }
}
