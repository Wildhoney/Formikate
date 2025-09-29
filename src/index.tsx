/* eslint-disable react-refresh/only-export-components */

import { useMemo, useState, type ReactElement } from 'react';
import type {
    FieldProps,
    Fields,
    FormikateProps,
    FormikateReturn,
    FormProps,
    Step,
} from './types';
import { Formik, type FormikValues } from 'formik';
import {
    Context,
    Expose,
    internalState,
    intoZodSchema,
    useContext,
    useLifecycle,
    useMutate,
    useReset,
} from './utils';

export function useFormikate({
    initialStep,
    steps,
}: FormikateProps): FormikateReturn {
    const [step, setStep] = useState<null | Step>(initialStep);
    const [fields, setFields] = useState<Fields>([]);

    const { current, next, previous } = useMemo(() => {
        const current = steps.findIndex((x) => x === step);
        const next = steps[current + 1];
        const previous = steps[current - 1];
        return { current, next, previous };
    }, [step, steps]);

    useReset({ steps, setStep });

    return useMemo(
        () => ({
            isNext: next != null,
            isPrevious: previous != null,
            step,
            next: () => next != null && setStep(next),
            previous: () => previous != null && setStep(previous),
            goto: (step) => setStep(step),
            [internalState]: {
                step,
                fields,
                steps,
                setStep,
                setFields,
                currentStepIndex: current,
                validationSchema: intoZodSchema(
                    fields.filter((field) => {
                        if (step == null) return true;
                        const fieldStep = steps.findIndex(
                            (x) => x === field.step,
                        );
                        return fieldStep !== -1 && fieldStep <= current;
                    }),
                ),
            },
        }),
        [current, fields, next, previous, step, steps],
    );
}

export function Form<Values extends FormikValues>({
    children,
    ...props
}: FormProps<Values>) {
    const formikate = useMemo(
        () => props.validationSchema ?? props.validate,
        [props.validationSchema, props.validate],
    );

    return (
        <Context.Provider value={formikate}>
            <Formik
                {...props}
                validate={undefined}
                validationSchema={formikate[internalState].validationSchema}
            >
                {(props) => (
                    <>
                        {typeof children === 'function'
                            ? children(props)
                            : children}
                        <Expose />
                    </>
                )}
            </Formik>
        </Context.Provider>
    );
}

export function Field({ children, ...props }: FieldProps): null | ReactElement {
    const context = useContext();
    const state = useMemo(() => context?.[internalState], [context]);

    useLifecycle(props);
    useMutate(props);

    if (state.step != null && state.step !== props.step) return null;

    return <>{children}</>;
}
