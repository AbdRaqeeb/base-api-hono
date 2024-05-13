import Joi, { ObjectSchema } from 'joi';
import * as types from '../../types';
import { PASSWORD_REGEX } from '../../constants';

export const forgotPasswordSchema: ObjectSchema<types.ForgotPasswordSchema> = Joi.object({
    email: Joi.string().required(),
});

export const resetPasswordSchema: ObjectSchema<types.ResetPasswordSchema> = Joi.object({
    code: Joi.string().required(),
    password: Joi.string().pattern(new RegExp(PASSWORD_REGEX)).required(),
});

export const confirmEmailSchema: ObjectSchema<types.ConfirmEmailSchema> = Joi.object({
    code: Joi.string().required(),
});

export const setPasswordSchema: ObjectSchema<types.SetPasswordSchema> = Joi.object({
    code: Joi.string().required(),
    password: Joi.string().pattern(new RegExp(PASSWORD_REGEX)).required(),
});

export const changePasswordSchema: ObjectSchema<types.ChangePasswordSchema> = Joi.object({
    password: Joi.string().required(),
    new_password: Joi.string().pattern(new RegExp(PASSWORD_REGEX)).required(),
});
