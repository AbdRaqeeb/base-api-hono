import Joi, { ObjectSchema } from 'joi';
import * as types from '../../types';
import { AgeRange } from '../../types/enums';
import { PASSWORD_REGEX } from '../../constants';

export const createUserSchema: ObjectSchema<types.UserCreateSchema> = Joi.object({
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    email: Joi.string().required(),
    age_range: Joi.string()
        .valid(...Object.values(AgeRange))
        .optional(),
    password: Joi.string().pattern(new RegExp(PASSWORD_REGEX)).optional(),
    avatar_url: Joi.string()
        .uri({ scheme: ['https', 'http'] })
        .optional(),
});

export const updateUserSchema: ObjectSchema<types.UserUpdateSchema> = Joi.object({
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    age_range: Joi.string()
        .valid(...Object.values(AgeRange))
        .optional(),
    is_active: Joi.boolean().optional(),
    avatar_url: Joi.string()
        .uri({ scheme: ['https', 'http'] })
        .optional(),
});

export const userLoginSchema: ObjectSchema<types.UserLoginSchema> = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
});
