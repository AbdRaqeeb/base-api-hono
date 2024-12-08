import { Knex } from 'knex';
import * as repositories from '../repositories';
import { Repository } from '../types';

export function createRepositories(DB: Knex): Repository {
    return {
        user: repositories.newUserRepository({ DB }),
    };
}
