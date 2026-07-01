import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as z from 'zod';
import { useForm, useFields, Mode, Cursor } from './index.js';
import type { Config } from './index.js';

type FieldsMap = Config['fields'];

function setup<Steps extends string>(
    fields: FieldsMap,
    steps: readonly Steps[] = ['only'] as unknown as readonly Steps[],
) {
    return renderHook(() => {
        const form = useForm({
            fields,
            onSubmit: () => {},
        });
        useFields(form, () => ({
            steps,
            fields: fields as Config<Steps>['fields'],
        }));
        return form;
    });
}

describe('Field mode predicates', () => {
    it('defaults to Mode.Attached when mode is undefined', () => {
        const { result } = setup({
            name: { step: 'only', validate: z.string(), value: '' },
        });

        expect(result.current.status.field.name.mode(Mode.Attached)).toBe(true);
        expect(result.current.status.field.name.mode(Mode.Detached)).toBe(
            false,
        );
        expect(result.current.status.field.name.hidden()).toBe(false);
        expect(result.current.status.field.name.visible()).toBe(true);
    });

    it('reflects explicit hidden attached field', () => {
        const { result } = setup({
            csrf: {
                step: 'only',
                validate: z.string(),
                value: 'token',
                hidden: true,
            },
        });

        expect(result.current.status.field.csrf.mode(Mode.Attached)).toBe(true);
        expect(result.current.status.field.csrf.hidden()).toBe(true);
        expect(result.current.status.field.csrf.visible()).toBe(false);
    });

    it('reflects explicit Mode.Detached', () => {
        const { result } = setup({
            absent: {
                step: 'only',
                validate: z.string(),
                value: '',
                mode: Mode.Detached,
            },
        });

        expect(result.current.status.field.absent.mode(Mode.Detached)).toBe(
            true,
        );
        expect(result.current.status.field.absent.mode(Mode.Attached)).toBe(
            false,
        );
        expect(result.current.status.field.absent.visible()).toBe(false);
    });

    it('hidden flag is ignored when mode is Detached', () => {
        const { result } = setup({
            absent: {
                step: 'only',
                validate: z.string(),
                value: '',
                mode: Mode.Detached,
                hidden: true,
            },
        });

        expect(result.current.status.field.absent.hidden()).toBe(false);
        expect(result.current.status.field.absent.visible()).toBe(false);
    });
});

describe('Step mode derivation', () => {
    it('step with at least one visible attached field is visible', () => {
        const { result } = setup({
            visible: { step: 'only', validate: z.string(), value: '' },
            hidden: {
                step: 'only',
                validate: z.string(),
                value: 'token',
                hidden: true,
            },
        });

        expect(result.current.status.step.only.mode(Mode.Attached)).toBe(true);
        expect(result.current.status.step.only.hidden()).toBe(false);
        expect(result.current.status.step.only.visible()).toBe(true);
    });

    it('step with only hidden attached fields is attached but hidden', () => {
        const { result } = setup({
            csrf: {
                step: 'only',
                validate: z.string(),
                value: 'token',
                hidden: true,
            },
        });

        expect(result.current.status.step.only.mode(Mode.Attached)).toBe(true);
        expect(result.current.status.step.only.hidden()).toBe(true);
        expect(result.current.status.step.only.visible()).toBe(false);
    });

    it('step with mixed hidden + detached resolves to hidden', () => {
        const { result } = setup({
            csrf: {
                step: 'only',
                validate: z.string(),
                value: 'token',
                hidden: true,
            },
            absent: {
                step: 'only',
                validate: z.string(),
                value: '',
                mode: Mode.Detached,
            },
        });

        expect(result.current.status.step.only.mode(Mode.Attached)).toBe(true);
        expect(result.current.status.step.only.hidden()).toBe(true);
    });

    it('step with only detached fields resolves to Mode.Detached', () => {
        const { result } = setup({
            absent: {
                step: 'only',
                validate: z.string(),
                value: '',
                mode: Mode.Detached,
            },
        });

        expect(result.current.status.step.only.mode(Mode.Detached)).toBe(true);
        expect(result.current.status.step.only.visible()).toBe(false);
    });

    it('step with zero fields resolves to Mode.Attached', () => {
        const { result } = setup({}, ['done']);

        expect(result.current.status.step.done.mode(Mode.Attached)).toBe(true);
        expect(result.current.status.step.done.visible()).toBe(true);
    });
});

describe('Step state', () => {
    it('active() is true only for the current step', () => {
        const { result } = setup(
            {
                first: { step: 'first', validate: z.string(), value: '' },
                second: { step: 'second', validate: z.string(), value: '' },
            },
            ['first', 'second'],
        );

        expect(result.current.status.step.first.active()).toBe(true);
        expect(result.current.status.step.second.active()).toBe(false);
    });

    it('fields() lists visible attached field names only', () => {
        const { result } = setup(
            {
                visible: { step: 'only', validate: z.string(), value: '' },
                hidden: {
                    step: 'only',
                    validate: z.string(),
                    value: 't',
                    hidden: true,
                },
                absent: {
                    step: 'only',
                    validate: z.string(),
                    value: '',
                    mode: Mode.Detached,
                },
            },
            ['only'],
        );

        expect(result.current.status.step.only.fields()).toEqual(['visible']);
    });
});

describe('Navigation', () => {
    const threeSteps = ['first', 'second', 'third'] as const;
    const threeFields: FieldsMap = {
        a: { step: 'first', validate: z.string(), value: '' },
        b: { step: 'second', validate: z.string(), value: '' },
        c: { step: 'third', validate: z.string(), value: '' },
    };

    it('to(Cursor.Next) advances and exists() reflects bounds', () => {
        const { result } = setup(threeFields, threeSteps);

        expect(result.current.status.progress.current()).toBe('first');
        expect(result.current.status.navigate.possible(Cursor.Previous)).toBe(
            false,
        );
        expect(result.current.status.navigate.possible(Cursor.Next)).toBe(true);

        act(() => result.current.status.navigate.to(Cursor.Next));
        expect(result.current.status.progress.current()).toBe('second');
        expect(result.current.status.navigate.possible(Cursor.Previous)).toBe(
            true,
        );
        expect(result.current.status.navigate.possible(Cursor.Next)).toBe(true);

        act(() => result.current.status.navigate.to(Cursor.Next));
        expect(result.current.status.progress.current()).toBe('third');
        expect(result.current.status.navigate.possible(Cursor.Next)).toBe(
            false,
        );
    });

    it('to(Cursor.Previous) moves back one step', () => {
        const { result } = setup(threeFields, threeSteps);

        act(() => result.current.status.navigate.to(Cursor.Last));
        expect(result.current.status.progress.current()).toBe('third');

        act(() => result.current.status.navigate.to(Cursor.Previous));
        expect(result.current.status.progress.current()).toBe('second');
    });

    it('Cursor.First and Cursor.Last jump to endpoints', () => {
        const { result } = setup(threeFields, threeSteps);

        act(() => result.current.status.navigate.to(Cursor.Last));
        expect(result.current.status.progress.current()).toBe('third');

        act(() => result.current.status.navigate.to(Cursor.First));
        expect(result.current.status.progress.current()).toBe('first');
    });

    it('to(step) navigates by identifier', () => {
        const { result } = setup(threeFields, threeSteps);

        act(() => result.current.status.navigate.to('third'));
        expect(result.current.status.progress.current()).toBe('third');
    });

    it('exists(step) is true for reachable steps only', () => {
        const { result } = setup(threeFields, threeSteps);

        expect(result.current.status.navigate.possible('second')).toBe(true);
        expect(result.current.status.navigate.possible('nonexistent')).toBe(
            false,
        );
    });

    it('skips hidden and detached steps', () => {
        const { result } = setup(
            {
                a: { step: 'first', validate: z.string(), value: '' },
                hiddenField: {
                    step: 'second',
                    validate: z.string(),
                    value: 'token',
                    hidden: true,
                },
                absentField: {
                    step: 'third',
                    validate: z.string(),
                    value: '',
                    mode: Mode.Detached,
                },
                d: { step: 'fourth', validate: z.string(), value: '' },
            },
            ['first', 'second', 'third', 'fourth'] as const,
        );

        expect(
            result.current.status.progress.steps().map((step) => step.id),
        ).toEqual(['first', 'fourth']);

        act(() => result.current.status.navigate.to(Cursor.Next));
        expect(result.current.status.progress.current()).toBe('fourth');
    });
});

describe('Initial values', () => {
    it('derives initial values from each field.value', () => {
        const { result } = setup({
            name: { step: 'only', validate: z.string(), value: 'hello' },
            count: { step: 'only', validate: z.number(), value: 42 },
            flag: { step: 'only', validate: z.boolean(), value: true },
        });

        expect(result.current.values).toEqual({
            name: 'hello',
            count: 42,
            flag: true,
        });
    });
});

describe('Required / optional from Zod schema', () => {
    it('required(): schema rejects undefined', () => {
        const { result } = setup({
            name: { step: 'only', validate: z.string(), value: '' },
        });

        expect(result.current.status.field.name.required()).toBe(true);
        expect(result.current.status.field.name.optional()).toBe(false);
    });

    it('optional(): schema accepts undefined', () => {
        const { result } = setup({
            nickname: {
                step: 'only',
                validate: z.string().optional(),
                value: '',
            },
        });

        expect(result.current.status.field.nickname.required()).toBe(false);
        expect(result.current.status.field.nickname.optional()).toBe(true);
    });
});

describe('Progress', () => {
    it('position(), first(), last() reflect the current index', () => {
        const { result } = setup(
            {
                a: { step: 'first', validate: z.string(), value: '' },
                b: { step: 'second', validate: z.string(), value: '' },
                c: { step: 'third', validate: z.string(), value: '' },
            },
            ['first', 'second', 'third'] as const,
        );

        expect(result.current.status.progress.position()).toBe(0);
        expect(result.current.status.progress.first()).toBe(true);
        expect(result.current.status.progress.last()).toBe(false);
        expect(result.current.status.progress.total()).toBe(3);

        act(() => result.current.status.navigate.to(Cursor.Last));
        expect(result.current.status.progress.position()).toBe(2);
        expect(result.current.status.progress.first()).toBe(false);
        expect(result.current.status.progress.last()).toBe(true);
    });
});

describe('Empty form', () => {
    it('status.empty is true when no fields or steps are configured', () => {
        const { result } = renderHook(() => {
            const form = useForm({
                fields: {},
                onSubmit: () => {},
            });
            useFields(form, () => ({ steps: [], fields: {} }));
            return form;
        });

        expect(result.current.status.empty).toBe(true);
    });

    it('status.empty is false when fields are configured', () => {
        const { result } = setup({
            name: { step: 'only', validate: z.string(), value: '' },
        });

        expect(result.current.status.empty).toBe(false);
    });
});

describe('onInvalid callback', () => {
    function setupWithInvalid<Steps extends string>(
        fields: FieldsMap,
        onInvalid: (errors: Record<string, unknown>) => void,
        steps: readonly Steps[] = ['only'] as unknown as readonly Steps[],
    ) {
        return renderHook(() => {
            const form = useForm({
                fields,
                onSubmit: () => {},
                onInvalid,
            });
            useFields(form, () => ({
                steps,
                fields: fields as Config<Steps>['fields'],
            }));
            return form;
        });
    }

    it('fires with a descriptor plus error for each invalid visible field', async () => {
        const calls: Record<string, unknown>[] = [];
        const fields = {
            name: {
                step: 'only',
                validate: z.string().min(1, 'Name is required'),
                value: '',
            },
        } satisfies FieldsMap;

        const { result } = setupWithInvalid(fields, (errors) => {
            calls.push(errors);
        });

        await act(async () => {
            await result.current.submitForm();
        });

        expect(calls).toHaveLength(1);
        expect(calls[0]).toEqual({
            name: {
                step: 'only',
                validate: fields.name.validate,
                value: '',
                error: 'Name is required',
            },
        });
    });

    it('surfaces hidden: true on the descriptor for hidden invalid fields', async () => {
        const calls: Record<string, { hidden?: boolean; error: string }>[] = [];
        const fields = {
            csrf: {
                step: 'only',
                validate: z.string().min(1, 'CSRF token missing'),
                value: '',
                hidden: true,
            },
        } satisfies FieldsMap;

        const { result } = setupWithInvalid(
            fields,
            (errors) =>
                void calls.push(
                    errors as Record<string, { hidden?: boolean; error: string }>,
                ),
        );

        await act(async () => {
            await result.current.submitForm();
        });

        expect(calls).toHaveLength(1);
        expect(calls[0].csrf.hidden).toBe(true);
        expect(calls[0].csrf.error).toBe('CSRF token missing');
    });

    it('only includes invalid fields, not valid ones', async () => {
        const calls: Record<string, unknown>[] = [];
        const fields = {
            filled: {
                step: 'only',
                validate: z.string().min(1, 'required'),
                value: 'ok',
            },
            empty: {
                step: 'only',
                validate: z.string().min(1, 'required'),
                value: '',
            },
        } satisfies FieldsMap;

        const { result } = setupWithInvalid(fields, (errors) => {
            calls.push(errors);
        });

        await act(async () => {
            await result.current.submitForm();
        });

        expect(calls).toHaveLength(1);
        expect(Object.keys(calls[0])).toEqual(['empty']);
    });

    it('does not fire when the form submits successfully', async () => {
        const calls: Record<string, unknown>[] = [];
        const fields = {
            name: {
                step: 'only',
                validate: z.string().min(1, 'required'),
                value: 'valid',
            },
        } satisfies FieldsMap;

        const { result } = setupWithInvalid(fields, (errors) => {
            calls.push(errors);
        });

        await act(async () => {
            await result.current.submitForm();
        });

        expect(calls).toHaveLength(0);
    });
});

describe('Dynamic fields', () => {
    it('seeds Formik values when an attached field is registered after mount', async () => {
        const { result, rerender } = renderHook(
            ({ fields }: { fields: FieldsMap }) => {
                const form = useForm({ fields, onSubmit: () => {} });
                useFields(form, () => ({
                    steps: ['only'] as const,
                    fields: fields as Config<'only'>['fields'],
                }));
                return form;
            },
            { initialProps: { fields: {} as FieldsMap } },
        );

        expect(result.current.values).toEqual({});

        await act(async () => {
            rerender({
                fields: {
                    late: {
                        step: 'only',
                        validate: z.string().min(1, 'required'),
                        value: '',
                    },
                },
            });
        });

        expect(result.current.values).toEqual({ late: '' });

        await act(async () => {
            await result.current.submitForm();
        });

        expect(result.current.touched).toEqual({ late: true });
        expect(result.current.errors).toEqual({ late: 'required' });
    });
});
