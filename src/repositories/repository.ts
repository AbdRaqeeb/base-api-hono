import { Knex } from 'knex';
import { Repository } from '../types';
import * as repositories from '../repositories';

export function createRepositories(DB: Knex): Repository {
    return {
        user: repositories.newUserRepository({ DB }),
    };
}
