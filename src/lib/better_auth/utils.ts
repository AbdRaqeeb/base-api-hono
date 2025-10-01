import { BetterAuthPlugin, GenericEndpointContext, Session, User as BetterAuthUser } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/plugins';
import { getSessionFromCtx } from 'better-auth/api';
import logger from '../../log';
import { CacheService, Repository } from '../../types';
import { UserRole } from '../../types/enums';
import { generateId } from '../custom';

type UserWithAddedFields = BetterAuthUser & {
    username: string;
    role: UserRole;
};

export const hooks = {
    user: (cache: CacheService, _repo: Repository) => ({
        create: {
            before: async (user: UserWithAddedFields, ctx: GenericEndpointContext) => {
                const first_name = user?.name?.split(' ')[0] || '';
                const last_name = user?.name?.split(' ')[1] || '';

                if (!user.username) user.username = `${first_name}.${last_name}.${generateId(4)}`;

                return {
                    data: {
                        ...user,
                        first_name,
                        last_name,
                        role: ctx.body?.role || UserRole.User,
                    },
                };
            },
            after: async (user: UserWithAddedFields) => {
                await addUsernameToCache(cache, user);
            },
        },
        update: {
            before: async (user: UserWithAddedFields) => {
                return { data: user };
            },
            after: async (user: UserWithAddedFields) => {
                await addUsernameToCache(cache, user);
            },
        },
    }),
};

async function addUsernameToCache(cache: CacheService, user: UserWithAddedFields) {
    try {
        await cache.username.set(user.username);
    } catch (error) {
        logger.error(error, '[BetterAuth][Hooks][User][After][AddUsernameToCache] - Error');
    }
}

async function removeUsernameFromCache(cache: CacheService, username: string) {
    try {
        await cache.username.invalidate(username);
    } catch (error) {
        logger.error(error, '[BetterAuth][Hooks][User][After][RemoveUsernameFromCache] - Error');
    }
}

export function plugins(repo: Repository) {
    async function customSession({ user, session }: { user: BetterAuthUser; session: Session }) {
        const customUser = await repo.user.get({ id: user.id });
        return { user: { ...customUser, ...user }, session };
    }

    return { customSession };
}

export function usernameUpdatePlugin(cache: CacheService) {
    return {
        id: 'username-update-plugin',
        hooks: {
            before: [
                {
                    matcher: (context) => {
                        return context.path === '/update-user';
                    },
                    handler: createAuthMiddleware(async (context) => {
                        const session = await getSessionFromCtx(context);
                        const body: Record<string, any> = context.body;

                        if (body?.username && body.username !== session?.user?.username) {
                            await removeUsernameFromCache(cache, session.user.username);
                        }

                        return { context };
                    }),
                },
            ],
        },
    } satisfies BetterAuthPlugin;
}
