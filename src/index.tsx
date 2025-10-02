/* eslint-disable react-refresh/only-export-components */

import * as z from 'zod';
import { useId, useMemo, useState, type ReactElement } from 'react';
import type {
    FieldProps,
    Fields,
    FormikateProps,
    FormikateReturn,
    FormProps,
    SectionProps,
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
    useSteps,
} from './utils';

export function useFormikate({
    initialStep,
    steps,
}: FormikateProps): FormikateReturn {
    const [step, setStep] = useState<null | Step>(initialStep);
    const [fields, setFields] = useState<Fields>([]);

    const { current, next, previous } = useSteps({ step, steps, fields });

    useReset({ steps, setStep });

    return useMemo(
        () => ({
            isNext: next != null,
            isPrevious: previous != null,
            step,
            progress: {
                current: current + 1,
                total: fields.filter((field) => field.step).length + 1,
            },
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

export function Section({ step, children }: SectionProps) {
    const name = useId();
    const context = useContext();
    const state = useMemo(() => context?.[internalState], [context]);

    useLifecycle({
        name: `formikate.section.${name}`,
        step,
        validate: z.any(),
    });

    if (state.step != null && state.step !== step) return null;

    return <>{children}</>;
}
