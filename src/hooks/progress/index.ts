import { useMemo } from 'react';
import type { Field, StepName } from '~/types.js';
import type { ProgressProps } from './types.js';

export function useProgress({ fields, stepSequence }: ProgressProps) {
    return useMemo(
        () =>
            new Set(
                fields
                    .map((field: Field) => field.step)
                    .filter((step): step is StepName => step != null)
                    .sort(
                        (a: StepName, b: StepName) =>
                            stepSequence.indexOf(a) - stepSequence.indexOf(b),
                    ),
            ),
        [fields, stepSequence],
    );
}
