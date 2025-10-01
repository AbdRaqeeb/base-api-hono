import type Redis from 'ioredis';
import { USERNAME_CACHE_PREFIX } from '../../constants';
import logger from '../../log';
import { UsernameCacheService } from '../../types';

interface UsernameCacheStore {
    redis: Redis;
}

export function newUsernameCacheService(ucs: UsernameCacheStore): UsernameCacheService {
    function getKey(username: string): string {
        return `${USERNAME_CACHE_PREFIX}${username}`;
    }

    async function exist(username: string): Promise<boolean> {
        try {
            const key = getKey(username).toLowerCase();
            const cached = await ucs.redis.get(key);
            return !!cached;
        } catch (error) {
            logger.error(error, '[NewUsernameCacheService][Exist]');
            return false;
        }
    }

    async function set(username: string): Promise<void> {
        try {
            const key = getKey(username);
            await ucs.redis.set(key, username, 'NX');
        } catch (error) {
            logger.error(error, '[NewUsernameCacheService][Set]');
        }
    }

    async function invalidate(username: string): Promise<void> {
        try {
            const key = getKey(username).toLowerCase();
            await ucs.redis.del(key);
        } catch (error) {
            logger.error(error, '[NewUsernameCacheService][Invalidate]');
        }
    }

    async function refresh(username: string, newUsername: string): Promise<void> {
        try {
            const oldKey = getKey(username).toLowerCase();
            const newKey = getKey(newUsername).toLowerCase();

            // Use multi to make this atomic
            const multi = ucs.redis.multi();
            multi.del(oldKey);
            multi.set(newKey, newUsername, 'NX');
            await multi.exec();
        } catch (error) {
            logger.error(error, '[NewUsernameCacheService][Refresh]');
        }
    }

    async function invalidateAll(): Promise<void> {
        try {
            const pattern = `${USERNAME_CACHE_PREFIX}*`;
            const keys = await ucs.redis.keys(pattern);
            if (!keys?.length) return;

            await ucs.redis.del(...keys);
        } catch (error) {
            logger.error(error, '[NewUsernameCacheService][InvalidateAll]');
        }
    }

    return { set, exist, invalidate, invalidateAll, refresh };
}
