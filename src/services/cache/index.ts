import type Redis from 'ioredis';
import { CacheService, Repository } from '../../types';
import { newUsernameCacheService } from './username';

export function createCacheService(redis: Redis, _repo: Repository): CacheService {
    return {
        username: newUsernameCacheService({ redis }),
    };
}
