import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import Server from '../src/server';
import { HttpServer } from '../src/types/server';

describe('Server', () => {
    let server: HttpServer;

    beforeEach(async () => {
        server = await Server.start();
    });

    afterEach(async () => {
        await Server.stop();
    });

    it('should starts successfully', async () => {
        expect(server.listening).toBe(true);
    });

    it('should stop server', async () => {
        await Server.stop();
        expect(server.listening).toBe(false);
    });
});
