export interface UsernameCacheService {
    set: (username: string) => Promise<void>;
    exist: (username: string) => Promise<boolean>;
    invalidate: (username: string) => Promise<void>;
    refresh: (username: string, newUsername: string) => Promise<void>;
    invalidateAll: () => Promise<void>;
}
