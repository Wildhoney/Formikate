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
    useIntoField,
    useLifecycle,
    useMutate,
    useReset,
    useSteps,
} from './utils';

export function useFormikate({
    initialStep,
    steps,
}: FormikateProps): FormikateReturn {
    const [step, setStep] = useState<null | Step>(initialStep);
    const [fields, setFields] = useState<Fields>([]);

    const { current, next, previous } = useSteps({ step, steps, fields });

    useReset({ initialStep, steps, setStep });

    const progress = useMemo(
        () =>
            new Set(
                fields
                    .map((field) => field.step)
                    .sort((a, b) => steps.indexOf(a) - steps.indexOf(b)),
            ),
        [fields, steps],
    );

    return useMemo(
        () => ({
            isNext: next != null,
            isPrevious: previous != null,
            step,
            progress: [...progress].map((x) => ({
                step: x,
                current: x === step,
            })),
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
        [current, fields, next, previous, progress, step, steps],
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
    const field = useIntoField(props);

    useLifecycle(field);
    useMutate(field);

    if (state.step != null && state.step !== field.step) return null;

    return <>{children}</>;
}
