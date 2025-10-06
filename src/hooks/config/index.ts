import { useMemo } from 'react';
import type { FormikValues } from 'formik';

import { internalState } from '../../context/index.js';
import { useProgress } from '../progress/index.js';
import type { ConfigProps } from './types.js';
import type { FormikateReturn } from '~/types.js';

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

    return useMemo(
        () => ({
            ...form,
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
