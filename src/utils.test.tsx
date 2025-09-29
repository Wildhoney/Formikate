import { describe, it, expect } from 'vitest';
import * as z from 'zod';
import { renderHook } from '@testing-library/react';
import * as utils from './utils.tsx';
import type { Field, Step } from './types.ts';

describe('takeEarliest', () => {
    const steps: Step[] = [{ id: 'step1' }, { id: 'step2' }];
    const fields: Field[] = [
        { name: 'name', validate: z.string(), step: steps[0] },
        { name: 'age', validate: z.number(), step: steps[1] },
        { name: 'email', validate: z.string().email(), step: steps[0] },
    ];

    it('should return the earliest field with an error', () => {
        const errors = { age: 'Required', name: 'Required' };
        const earliest = utils.takeEarliest(errors, fields, steps);
        expect(earliest?.name).toBe('name');
    });

    it('should return undefined if there are no errors', () => {
        const errors = {};
        const earliest = utils.takeEarliest(errors, fields, steps);
        expect(earliest).toBeUndefined();
    });
});

describe('renderFields', () => {
    const steps: Step[] = [{ id: 'step1' }, { id: 'step2' }];
    const fields: Field[] = [
        { name: 'name', validate: z.string(), step: steps[0] },
        { name: 'age', validate: z.number(), step: steps[1] },
        { name: 'email', validate: z.string().email(), step: steps[0] },
        { name: 'address', validate: z.string() },
    ];

    it('should return fields for the current step', () => {
        const visibleFields = utils.renderFields(fields, steps[0], steps);
        expect(visibleFields.map((f) => f.name)).toEqual(['name', 'email']);
    });

    it('should return fields without a step if currentStep is null', () => {
        const visibleFields = utils.renderFields(fields, null, steps);
        expect(visibleFields.map((f) => f.name)).toEqual(['address']);
    });

    it('should return all fields if there are no steps', () => {
        const visibleFields = utils.renderFields(fields, null, []);
        expect(visibleFields.map((f) => f.name)).toEqual([
            'name',
            'age',
            'email',
            'address',
        ]);
    });
});

describe('usePredicate', () => {
    const steps: Step[] = [{ id: 'step1' }, { id: 'step2' }];
    const fields: Field[] = [
        { name: 'name', validate: z.string(), step: steps[0] },
        { name: 'age', validate: z.number(), step: steps[1] },
        { name: 'email', validate: z.string().email(), step: steps[0] },
        { name: 'address', validate: z.string() },
        { name: 'disabled', validate: z.string(), enabled: false },
    ];

    it('should return a predicate that filters fields based on the current step', () => {
        const { result } = renderHook(() =>
            utils.usePredicate({ steps, step: steps[0] }),
        );
        const predicate = result.current;
        const filteredFields = fields.filter(predicate);
        expect(filteredFields.map((f) => f.name)).toEqual(['name', 'email']);
    });

    it('should not filter if steps are not defined', () => {
        const { result } = renderHook(() => utils.usePredicate({}));
        const predicate = result.current;
        const filteredFields = fields.filter(predicate);
        expect(filteredFields.map((f) => f.name)).toEqual([
            'name',
            'age',
            'email',
            'address',
        ]);
    });

    it('should filter out disabled fields', () => {
        const { result } = renderHook(() => utils.usePredicate({}));
        const predicate = result.current;
        const filteredFields = fields.filter(predicate);
        expect(
            filteredFields.find((f) => f.name === 'disabled'),
        ).toBeUndefined();
    });
});
