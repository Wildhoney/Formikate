import { useMemo, useRef } from 'react';
import type { FormikValues } from 'formik';

import { internalState } from '../../context/index.js';
import { useProgress } from '../progress/index.js';
import { defer } from './utils.js';
import type { ConfigProps } from './types.js';
import type { FormikateReturn, Step } from '~/types.js';

export function useConfig<Values extends FormikValues>({
    current,
    fields,
    form,
    next,
    previous,
    step,
    stepSequence,
    setStep,
    setFields,
}: ConfigProps<Values>): FormikateReturn<Values> {
    const progress = useProgress({ fields, stepSequence });

    const refs = useRef({ next, previous });
    refs.current.next = next;
    refs.current.previous = previous;

    return useMemo(
        () => ({
            ...form,
            step,
            progress: [...progress].map((x) => ({
                step: x as Step | null,
                current: x === step,
            })),
            handleNext: () =>
                defer(() => refs.current.next && setStep(refs.current.next)),
            handlePrevious: () =>
                defer(
                    () =>
                        refs.current.previous && setStep(refs.current.previous),
                ),
            handleGoto: (run) => defer(() => setStep(run)),
            isNext: next != null,
            isPrevious: previous != null,
            isVisible: (name: string) => {
                const field = fields.find((field) => field.name === name);
                if (!field) return false;
                return field.step == null ? true : field.step === step;
            },
            isOptional: (name: string) => {
                const field = fields.find((field) => field.name === name);
                return field
                    ? field.validate.safeParse(undefined).success
                    : true;
            },
            isRequired: (name: string) => {
                const field = fields.find((field) => field.name === name);
                return field
                    ? !field.validate.safeParse(undefined).success
                    : false;
            },
            [internalState]: {
                form,
                step,
                fields,
                stepSequence,
                setStep,
                setFields,
                currentStepIndex: current,
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
            stepSequence,
            setStep,
            setFields,
        ],
    );
}
