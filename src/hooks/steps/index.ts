import * as React from 'react';
import { type FormikValues } from 'formik';
import type { Field, Step } from '~/types.js';

import type { StepsProps } from './types.js';

export function useSteps<Values extends FormikValues>({
    step,
    stepSequence,
    fields,
}: StepsProps<Values>) {
    return React.useMemo(() => {
        if (!stepSequence) {
            return {
                current: null,
                previous: null,
                next: null,
            };
        }

        const current = stepSequence.findIndex((x: Step) => x === step);

        const indices = fields
            .map((field: Field) =>
                stepSequence.findIndex((step: Step) => step === field.step),
            )
            .filter((index: number) => index !== -1);

        const previousIndex = Math.max(
            ...indices.filter((index: number) => index < current),
            -1,
        );
        const nextIndex = Math.min(
            ...indices.filter((index: number) => index > current),
            Infinity,
        );

        return {
            current,
            previous: previousIndex === -1 ? null : stepSequence[previousIndex],
            next: nextIndex === Infinity ? null : stepSequence[nextIndex],
        };
    }, [step, stepSequence, fields]);
}
