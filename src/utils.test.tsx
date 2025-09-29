import { describe, it, expect } from 'vitest';
import * as z from 'zod';
import { intoZodSchema } from './utils';

describe('intoZodSchema', () => {
    it('should create a validation schema from fields', async () => {
        const fields = [
            {
                name: 'name',
                validate: z.string().min(1, 'Name is required'),
                step: 'a',
                label: 'Name',
            },
            {
                name: 'email',
                validate: z.string().email('Invalid email'),
                step: 'a',
                label: 'Email',
            },
            {
                name: 'age',
                validate: z.number().min(18, 'Must be 18 or older'),
                step: 'b',
                label: 'Age',
            },
        ];

        const schema = intoZodSchema(fields);

        // Test with valid data
        await expect(
            schema.validate(
                { name: 'John', email: 'john@doe.com', age: 20 },
                {},
            ),
        ).resolves.toBeUndefined();

        // Test with invalid data
        const invalidData = { name: '', email: 'not-an-email', age: 17 };
        await expect(schema.validate(invalidData, {})).rejects.toMatchObject({
            inner: expect.arrayContaining([
                expect.objectContaining({
                    path: 'name',
                    message: 'Name is required',
                }),
                expect.objectContaining({
                    path: 'email',
                    message: 'Invalid email',
                }),
                expect.objectContaining({
                    path: 'age',
                    message: 'Must be 18 or older',
                }),
            ]),
        });

        // Test with partially invalid data
        const partiallyInvalidData = {
            name: 'John',
            email: 'john@doe.com',
            age: 17,
        };
        await expect(
            schema.validate(partiallyInvalidData, {}),
        ).rejects.toMatchObject({
            inner: [
                expect.objectContaining({
                    path: 'age',
                    message: 'Must be 18 or older',
                }),
            ],
        });
    });
});
