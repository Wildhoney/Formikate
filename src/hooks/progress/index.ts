import { useMemo } from 'react';
import type { Field, Step } from '~/types.js';
import type { ProgressProps } from './types.js';

export function useProgress({ fields, stepSequence }: ProgressProps) {
    return useMemo(
        () =>
            new Set(
                fields
                    .map((field: Field) => field.step)
                    .sort(
                        (a: Step, b: Step) =>
                            stepSequence.indexOf(a) - stepSequence.indexOf(b),
                    ),
            ),
        [fields, stepSequence],
    );
}
