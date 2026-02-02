import { useMemo } from 'react';
import type { StepRegistration } from '~/types.js';
import type { ProgressProps } from './types.js';

export function useProgress({ steps }: ProgressProps) {
    return useMemo(
        () =>
            steps
                .filter((step: StepRegistration) => step.fieldCount > 0)
                .map((step: StepRegistration) => step.order),
        [steps],
    );
}
