import Joi, { ObjectSchema } from 'joi';
import * as types from '../../types';
import { Role } from '../../types/enums';

export const createAdminSchema: ObjectSchema<types.AdminCreateSchema> = Joi.object({
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    email: Joi.string().required(),
    username: Joi.string().required(),
    role: Joi.string()
        .valid(...Object.values(Role))
        .optional(),
});

export const adminLoginSchema: ObjectSchema<types.AdminLoginSchema> = Joi.object({
    email_or_username: Joi.string().required(),
    password: Joi.string().required(),
});

export const updateAdminSchema: ObjectSchema<types.AdminUpdateSchema> = Joi.object({
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
});
