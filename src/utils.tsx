/* eslint-disable react-refresh/only-export-components */

import * as React from 'react';
import type {
    Fields,
    FormikateReturn,
    LifecycleProps,
    MutateProps,
    ResetProps,
} from './types';
import { getIn, useFormikContext } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import * as z from 'zod';

export const Context = React.createContext<null | FormikateReturn>(null);

export const internalState = Symbol('formikate.internalState');

export function useContext(): FormikateReturn {
    const context = React.useContext(Context);
    if (!context) {
        throw new Error('useContext must be used within a Formikate Form');
    }
    return context;
}

export function useReset({ steps, setStep }: ResetProps) {
    const ref = React.useRef<boolean>(false);
    const dependency = JSON.stringify(steps);

    React.useLayoutEffect((): void => {
        if (ref.current) {
            const firstStep = steps?.[0] ?? null;
            setStep(firstStep);
            ref.current = true;
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dependency]);
}

export function useLifecycle(field: LifecycleProps) {
    const context = useContext();
    const form = useFormikContext();
    const state = React.useMemo(() => context[internalState], [context]);

    React.useLayoutEffect(() => {
        state.setFields((fields) => [
            ...fields.filter(({ name }) => field.name !== name),
            field,
        ]);

        return () => {
            form.setFieldValue(
                field.name,
                getIn(form.initialValues, field.name),
            );
            state.setFields((fields) =>
                fields.filter(({ name }) => field.name !== name),
            );
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}

export function useMutate(field: MutateProps) {
    const context = useContext();
    const state = React.useMemo(() => context[internalState], [context]);
    const dependency = JSON.stringify([field.name, field.validate]);

    React.useLayoutEffect(() => {
        state.setFields((fields) => {
            const exists = fields.find(({ name }) => field.name === name);
            if (exists) {
                return fields.map((x) =>
                    x.name === field.name ? { ...x, ...field } : x,
                );
            }
            return [...fields, field];
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dependency]);
}

export function intoZodSchema(fields: Fields) {
    const validationSchema = fields.reduce<Record<string, z.ZodTypeAny>>(
        (fields, field) => ({ ...fields, [field.name]: field.validate }),
        {},
    );

    return toFormikValidationSchema(z.object(validationSchema));
}

export function Expose(): null {
    const ref = React.useRef<number>(0);
    const form = useFormikContext();
    const context = useContext();
    const state = React.useMemo(() => context[internalState], [context]);

    React.useEffect(() => {
        if (ref.current === form.submitCount) {
            return;
        }

        ref.current = form.submitCount;

        const errorIndices = Object.keys(form.errors).map((key) => {
            const field = state.fields.find(({ name }) => name === key);
            return state.steps.findIndex((step) => field?.step === step);
        });

        const lowestIndex = Math.min(...errorIndices.filter((i) => i >= 0));

        if (lowestIndex < state.currentStepIndex) {
            state.setStep(state.steps[lowestIndex]);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.errors]);

    return null;
}
