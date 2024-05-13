import request from 'supertest';
import { createNewServer } from '../../src/api';

function buildTestServer() {
    return request(createNewServer().app);
}

export const server = buildTestServer();
