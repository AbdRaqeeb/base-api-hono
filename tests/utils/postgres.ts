import { createPgAdapter } from '../../src/database';

export const DB = createPgAdapter({ connectionString: process.env.DATABASE_URL });

export async function disconnectDatabase() {
    await DB.destroy();
}
