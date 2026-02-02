/* eslint-disable react-refresh/only-export-components */

import * as React from 'react';
import { useCallback, useLayoutEffect, useMemo, useState, type ReactElement } from 'react';
import type {
    Field,
    FieldProps,
    Fields,
    FormikateProps,
    FormikateReturn,
    FormProps,
    StepName,
    StepRegistration,
    VirtualField,
} from './types.js';

export type { StepName, FieldName, StepProps, StepRegistration } from './types.js';
import { FormikContext, useFormik, type FormikValues } from 'formik';
import {
    Context,
    CurrentStepContext,
    FieldNestingContext,
    internalState,
} from './context/index.js';
import { useField } from './hooks/field/index.js';
import { useLifecycle } from './hooks/lifecycle/index.js';
import { useMutate } from './hooks/mutate/index.js';

import { useSteps } from './hooks/steps/index.js';
import { useSchema } from './hooks/schema/index.js';
import { useConfig } from './hooks/config/index.js';
import { Expose } from './components/expose/index.js';
import { useContext } from './context/index.js';
export { Step } from './components/step/index.js';

/**
 * @name useForm
 * @description The primary hook for creating and managing a multi-step form.
 * @param {FormikateProps<Values>} props The configuration options for the form.
 * @returns {FormikateReturn<Values>} The state and methods for managing the form.
 */
export function useForm<Values extends FormikValues>(
    props: FormikateProps<Values>,
): FormikateReturn<Values> {
    const [currentStep, setCurrentStep] = useState<null | StepName>(null);
    const [fields, setFields] = useState<Fields>([]);
    const [stepRegistry, setStepRegistry] = useState<Map<string, StepRegistration>>(new Map());

    const steps = useMemo(
        () => Array.from(stepRegistry.values()).sort((a, b) => a.order - b.order),
        [stepRegistry],
    );

    const hasInitializedStep = React.useRef(false);

    useLayoutEffect(() => {
        if (!hasInitializedStep.current && steps.length > 0) {
            const initialStep = steps.find((s) => s.initial) ?? steps[0];
            if (initialStep) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCurrentStep(initialStep.order);
                hasInitializedStep.current = true;
            }
        }
    }, [steps]);

    const registerStep = useCallback((step: StepRegistration, reactId: string) => {
        setStepRegistry((prev) => {
            const next = new Map(prev);
            next.set(reactId, step);
            return next;
        });
    }, []);

    const unregisterStep = useCallback((reactId: string) => {
        setStepRegistry((prev) => {
            const next = new Map(prev);
            next.delete(reactId);
            return next;
        });
    }, []);

    const incrementStepFieldCount = useCallback(() => {}, []);
    const decrementStepFieldCount = useCallback(() => {}, []);

    const stepsWithFieldCounts = useMemo(() => {
        const stepFieldCounts = new Map<number, number>();
        for (const field of fields) {
            if (field.stepOrder != null) {
                stepFieldCounts.set(
                    field.stepOrder,
                    (stepFieldCounts.get(field.stepOrder) || 0) + 1,
                );
            }
        }
        return Array.from(stepRegistry.values())
            .map((step) => ({
                ...step,
                fieldCount: stepFieldCounts.get(step.order) || 0,
            }))
            .sort((a, b) => a.order - b.order);
    }, [stepRegistry, fields]);

    const { current, next, previous } = useSteps({
        step: currentStep,
        steps: stepsWithFieldCounts,
        fields,
    });

    const schema = useSchema({ fields, step: currentStep, steps: stepsWithFieldCounts });
    const form = useFormik<Values>({ ...props, validationSchema: schema });

    return useConfig({
        current,
        fields,
        form,
        next,
        previous,
        step: currentStep,
        steps: stepsWithFieldCounts,
        setStep: setCurrentStep,
        setFields,
        registerStep,
        unregisterStep,
        incrementStepFieldCount,
        decrementStepFieldCount,
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

export function Field<T>(
    props: Field<T> & {
        hidden?: boolean;
        initial?: T;
        children: React.ReactNode;
    },
): null | ReactElement;

export function Field(
    props: VirtualField & {
        hidden?: boolean;
        children: React.ReactNode;
    },
): null | ReactElement;

export function Field<T = unknown>({
    hidden = false,
    initial: initialValue,
    children,
    ...props
}: FieldProps<T>): null | ReactElement {
    useContext();
    const parentStepOrder = React.useContext(CurrentStepContext);
    const field = useField({ ...props, stepOrder: parentStepOrder });
    const isNested = React.useContext(FieldNestingContext);
    if (isNested) {
        console.warn(
            `[Formikate] Field "${field.name}" is nested inside another Field — this may cause unexpected behavior.`,
        );
    }

    useLifecycle({ ...field, initial: initialValue });
    useMutate(field);

    return hidden ? null : (
        <FieldNestingContext value={true}>{children}</FieldNestingContext>
    );
}
