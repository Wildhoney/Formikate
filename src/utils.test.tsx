import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as z from 'zod';
import { intoZodSchema, useSteps } from './utils';

describe('useSteps', () => {
    const steps = ['a', 'b', 'c', 'd'];
    const fields = [
        { name: 'field1', step: 'a', validate: z.any() },
        { name: 'field2', step: 'c', validate: z.any() },
    ];

    it('should return the correct next and previous steps', () => {
        const { result } = renderHook(() =>
            useSteps({ step: 'a', steps, fields }),
        );
        expect(result.current.next).toBe('c');
        expect(result.current.previous).toBe(null);
    });

    it('should skip intermediate steps without fields', () => {
        const { result } = renderHook(() =>
            useSteps({ step: 'a', steps, fields }),
        );
        expect(result.current.next).toBe('c');
    });

    it('should return null for previous when on the first step', () => {
        const { result } = renderHook(() =>
            useSteps({ step: 'a', steps, fields }),
        );
        expect(result.current.previous).toBe(null);
    });

    it('should return null for next when on the last step with a field', () => {
        const { result } = renderHook(() =>
            useSteps({ step: 'c', steps, fields }),
        );
        expect(result.current.next).toBe(null);
    });

    it('should handle being on a step without a field', () => {
        const { result } = renderHook(() =>
            useSteps({ step: 'b', steps, fields }),
        );
        expect(result.current.next).toBe('c');
        expect(result.current.previous).toBe('a');
    });

    it('should return null for next and previous if there are no fields', () => {
        const { result } = renderHook(() =>
            useSteps({ step: 'a', steps, fields: [] }),
        );
        expect(result.current.next).toBe(null);
        expect(result.current.previous).toBe(null);
    });
});

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
