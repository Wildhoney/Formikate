/* eslint-disable react-refresh/only-export-components */

import { useMemo, useState, type ReactElement } from 'react';
import type {
    Field,
    FieldProps,
    Fields,
    FormikateProps,
    FormikateReturn,
    FormProps,
    Step,
} from './types.js';
import { FormikContext, useFormik, type FormikValues } from 'formik';
import { Context, internalState } from './context/index.js';
import { useField } from './hooks/field/index.js';
import { useLifecycle } from './hooks/lifecycle/index.js';
import { useMutate } from './hooks/mutate/index.js';
import { useReset } from './hooks/reset/index.js';

import { useSteps } from './hooks/steps/index.js';
import { useSchema } from './hooks/schema/index.js';
import { useConfig } from './hooks/config/index.js';
import { Expose } from './components/expose/index.js';
import { useContext } from './context/index.js';

/**
 * @name useForm
 * @description The primary hook for creating and managing a multi-step form.
 * @param {FormikateProps<Values>} props The configuration options for the form.
 * @returns {FormikateReturn<Values>} The state and methods for managing the form.
 */
export function useForm<Values extends FormikValues>({
    initialStep,
    stepSequence = [],
    ...props
}: FormikateProps<Values>): FormikateReturn<Values> {
    const [step, setStep] = useState<null | Step>(initialStep);
    const [fields, setFields] = useState<Fields>([]);

    const { current, next, previous } = useSteps<Values>({
        step,
        stepSequence,
        fields,
    });

    const schema = useSchema({ fields, step, stepSequence, current });
    const form = useFormik<Values>({ ...props, validationSchema: schema });

    useReset<Values>({ initialStep, stepSequence, setStep });

    return useConfig({
        current,
        fields,
        form,
        next,
        previous,
        step,
        stepSequence,
        setStep,
        setFields,
    });
}

/**
 * @name Form
 * @description The main form component that provides the Formik and Formikate contexts.
 * @param {FormProps<Values>} props The props for the form component.
 * @returns {React.ReactElement} The rendered form component.
 */
export function Form<Values extends FormikValues>({
    controller,
    children,
}: FormProps<Values>) {
    return (
        <Context.Provider
            value={controller as unknown as FormikateReturn<FormikValues>}
        >
            <FormikContext value={controller[internalState].form}>
                {children}
                <Expose />
            </FormikContext>
        </Context.Provider>
    );
}

/**
 * @name Field
 * @description A component for defining a field within the form.
 * @param {FieldProps} props The props for the field component.
 * @returns {null | React.ReactElement} The rendered field's children or null if the field is not in the current step.
 */
export function Field({
    hidden = false,
    children,
    ...props
}: FieldProps): null | ReactElement {
    const context = useContext();
    const state = useMemo(() => context?.[internalState], [context]);
    const field = useField(props);

    useLifecycle(field);
    useMutate(field);

    return hidden ||
        (state.step != null && state.step !== field.step) ? null : (
        <>{children}</>
    );
}
