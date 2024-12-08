import { describe, expect, it, spyOn } from 'bun:test';
import { faker } from '@faker-js/faker';
import Joi from 'joi';
import { DateTime } from 'luxon';

import { DEFAULT_SIZE, PASSWORD_REGEX } from '../../../src/constants';
import * as lib from '../../../src/lib';
import { RangeFilter } from '../../../src/types';
import { DB as db } from '../../utils';

describe('Custom Libraries', () => {
    describe('String', () => {
        describe('Generate Id', () => {
            it('should generate id with default length', () => {
                const id = lib.generateId();

                expect(id).toBeDefined();
                expect(id.length).toBe(15);
            });

            it('should generate id with defined length', () => {
                const length = 20;
                const id = lib.generateId(length);

                expect(id).toBeDefined();
                expect(id.length).toEqual(length);
            });
        });

        describe('Generate Random String', () => {
            it('should generate random string with default length', () => {
                const value = lib.generateRandomString();

                const DEFAULT_LENGTH = 10;

                expect(value).toBeDefined();
                expect(value.length).toBe(DEFAULT_LENGTH);
            });

            it('should generate random string with defined length', () => {
                const length = 20;
                const value = lib.generateRandomString({ length });

                expect(value).toBeDefined();
                expect(value.length).toEqual(length);
            });

            it('should generate random strings', () => {
                const length = 20;
                const valueOne = lib.generateRandomString({ length });
                const valueTwo = lib.generateRandomString({ length });

                expect(valueOne).toBeDefined();
                expect(valueTwo).toBeDefined();

                expect(valueOne).not.toEqual(valueTwo);
            });
        });
    });

    describe('Validate Schema', () => {
        it('should pass validation', () => {
            const schema = Joi.object({
                first_name: Joi.string().required(),
                last_name: Joi.string().required(),
            });

            const data = {
                first_name: 'John',
                last_name: 'Doe',
            };

            const { error, value } = lib.validateSchema(schema, data);

            expect(error).toBeUndefined();
            expect(value).toMatchObject(data);
        });

        it('should fail validation', () => {
            const schema = Joi.object({
                first_name: Joi.string().required(),
                last_name: Joi.string().required(),
            });

            const data = {
                first_name: 'John',
            };

            const { error, value } = lib.validateSchema(schema, data);

            expect(error).toBe('last_name is required');
            expect(value).toBeUndefined();
        });

        it('should fail validation for unknown parameter', () => {
            const schema = Joi.object({
                first_name: Joi.string().required(),
            });

            const data = {
                first_name: 'John',
                size: 'Big',
            };

            const { error, value } = lib.validateSchema(schema, data);

            expect(error).toBe(`Unknown/Unexpected parameter: 'size'`);
            expect(value).toBeUndefined();
        });

        it('should fail password validation', () => {
            const schema = Joi.object({
                first_name: Joi.string().required(),
                password: Joi.string().pattern(new RegExp(PASSWORD_REGEX)).required(),
            });

            const data = {
                first_name: 'John',
                password: 'Test',
            };

            const { error, value } = lib.validateSchema(schema, data);

            expect(error).toBe(
                'Password should be minimum of 8 characters, must contain at least 1 Uppercase letter, 1 lower case, 1 number and 1 special character'
            );
            expect(value).toBeUndefined();
        });

        it('should fail new password validation', () => {
            const schema = Joi.object({
                first_name: Joi.string().required(),
                new_password: Joi.string().pattern(new RegExp(PASSWORD_REGEX)).required(),
            });

            const data = {
                first_name: 'John',
                new_password: 'Test',
            };

            const { error, value } = lib.validateSchema(schema, data);

            expect(error).toBe(
                'New password should be minimum of 8 characters, must contain at least 1 Uppercase letter, 1 lower case, 1 number and 1 special character'
            );
            expect(value).toBeUndefined();
        });
    });

    describe('Pagination', () => {
        describe('Pagination Data', () => {
            it('should calculate pagination metadata', () => {
                const result = lib.getPaginationData({ page: '1', size: '10' });

                expect(result).toMatchObject({
                    startIndex: 0,
                    endIndex: 10,
                    size: 10,
                    page: 1,
                });
            });

            it('should calculate pagination metadata with default values', () => {
                const result = lib.getPaginationData({});

                expect(result).toMatchObject({
                    startIndex: 0,
                    endIndex: DEFAULT_SIZE,
                    size: DEFAULT_SIZE,
                    page: 1,
                });
            });
        });

        describe('Add Pagination Query', () => {
            it('should add pagination query', () => {
                const query = db('test');

                const offsetSpy = spyOn(query, 'offset');
                const limitSpy = spyOn(query, 'limit');

                lib.addPaginationQuery(query, {});

                const EXPECTED_OFFSET = 0;

                expect(limitSpy).toHaveBeenCalledWith(DEFAULT_SIZE);
                expect(offsetSpy).toHaveBeenCalledWith(EXPECTED_OFFSET);
            });
        });

        describe('Paginate', () => {
            it('should paginate result', async () => {
                const query = db('test');
                const data = [{ name: 'John Doe' }];
                const total = 20;
                const size = 10;

                spyOn(query, 'count').mockResolvedValue([{ total }]);

                const result = await lib.paginate(query, { page: '1', size: size.toString() }, data);

                expect(result).toMatchObject({
                    data,
                    pagination: {
                        total,
                        size,
                        current_page: 1,
                        next: { page: 2, size },
                        previous: null,
                    },
                });
            });
        });
    });

    describe('Stringify', () => {
        it('should stringify fields in object', () => {
            const data = {
                name: [faker.word.noun()],
                description: { test: faker.string.uuid() },
                age: faker.number.int({ max: 100, min: 1 }),
            };

            const result = lib.stringify({ ...data }, ['name', 'description']);

            expect(result).toMatchObject({
                name: JSON.stringify(data.name),
                description: JSON.stringify(data.description),
                age: data.age,
            });
        });
    });

    describe('Generate Otp', () => {
        it('should generate a 6-digit OTP', () => {
            const otp = lib.generateOtp();
            expect(otp).toHaveLength(6);
        });

        it('should only contain digits', () => {
            const otp = lib.generateOtp();
            expect(otp).toMatch(/^\d+$/);
        });

        it('should generate a new OTP each time', () => {
            const otp1 = lib.generateOtp();
            const otp2 = lib.generateOtp();
            expect(otp1).not.toBe(otp2);
        });
    });

    describe('Range Filter', () => {
        it('should add audit trail queries', () => {
            const filter: RangeFilter = {
                from: new Date().toISOString(),
                to: new Date().toISOString(),
            };
            const query = db('test');

            const whereSpy = spyOn(query, 'where');

            lib.addRangeQuery(query, filter, 't');

            const EXPECTED_CALL_TIMES = 2;

            expect(whereSpy).toHaveBeenCalledTimes(EXPECTED_CALL_TIMES);
            expect(whereSpy).toHaveBeenCalledWith(
                't.created_at',
                '>=',
                DateTime.fromISO(filter.from).toFormat('yyyy-MM-dd 00:00:00')
            );
            expect(whereSpy).toHaveBeenCalledWith(
                't.created_at',
                '<=',
                DateTime.fromISO(filter.to).toFormat('yyyy-MM-dd 00:00:00')
            );
        });
    });

    describe('Extract Field Names', () => {
        it('should extract correct field names from various inputs', () => {
            const fields = [
                'a.id as id',
                'a.first_name as first_name',
                'b.email as email',
                'c.complex_column as alias',
                'd.simple',
                'e.table.column',
            ];

            const result = lib.extractFieldNames(fields);

            expect(result).toEqual(['id', 'first_name', 'email', 'complex_column', 'simple', 'column']);
        });

        it('should handle fields without aliases', () => {
            const fields = ['a.id', 'b.name'];

            const result = lib.extractFieldNames(fields);

            expect(result).toEqual(['id', 'name']);
        });

        it('should handle empty input', () => {
            const fields: string[] = [];

            const result = lib.extractFieldNames(fields);

            expect(result).toEqual([]);
        });

        it('should handle fields with multiple dots', () => {
            const fields = ['schema.table.column as alias'];

            const result = lib.extractFieldNames(fields);

            expect(result).toEqual(['column']);
        });

        it('should handle fields with spaces in alias', () => {
            const fields = ['a.column as "complex alias"'];

            const result = lib.extractFieldNames(fields);

            expect(result).toEqual(['column']);
        });
    });
});
