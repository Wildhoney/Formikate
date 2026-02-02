import { useLayoutEffect, useMemo, useRef } from 'react';
import type { FormikValues } from 'formik';

import { internalState } from '../../context/index.js';
import { useProgress } from '../progress/index.js';
import { defer } from './utils.js';
import type { ConfigProps } from './types.js';
import type { FieldName, FormikateReturn, StepName } from '~/types.js';

export function useConfig<Values extends FormikValues>({
    current,
    fields,
    form,
    next,
    previous,
    step,
    steps,
    setStep,
    setFields,
    registerStep,
    unregisterStep,
    incrementStepFieldCount,
    decrementStepFieldCount,
}: ConfigProps<Values>): FormikateReturn<Values> {
    const progress = useProgress({ steps });

    const refs = useRef({ next, previous });

    useLayoutEffect(() => {
        refs.current.next = next;
        refs.current.previous = previous;
    }, [next, previous]);

    return useMemo(
        () => ({
            ...form,
            step,
            progress: progress.map((order) => ({
                step: order as StepName | null,
                current: order === step,
            })),
            handleNext() {
                defer(() => refs.current.next && setStep(refs.current.next));
            },
            handlePrevious() {
                defer(
                    () =>
                        refs.current.previous && setStep(refs.current.previous),
                );
            },
            handleGoto(run) {
                defer(() => setStep(run));
            },
            isEmpty: fields.length === 0,
            isNext: next != null,
            isPrevious: previous != null,
            isVisible(name: FieldName) {
                const field = fields.find((field) => field.name === name);
                if (!field) return false;
                return field.stepOrder == null ? true : field.stepOrder === step;
            },
            isStep(name: StepName) {
                return name === step;
            },
            isOptional(name: FieldName) {
                const field = fields.find((field) => field.name === name);
                return field
                    ? field.validate.safeParse(undefined).success
                    : true;
            },
            isRequired(name: FieldName) {
                const field = fields.find((field) => field.name === name);
                return field
                    ? !field.validate.safeParse(undefined).success
                    : false;
            },
            [internalState]: {
                form,
                step,
                fields,
                steps,
                setStep,
                setFields,
                currentStepIndex: current,
                registerStep,
                unregisterStep,
                incrementStepFieldCount,
                decrementStepFieldCount,
            },
        }),
        [
            current,
            fields,
            form,
            next,
            previous,
            progress,
            step,
            steps,
            setStep,
            setFields,
            registerStep,
            unregisterStep,
            incrementStepFieldCount,
            decrementStepFieldCount,
        ],
    );
}
