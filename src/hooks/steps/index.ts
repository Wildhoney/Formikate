import * as React from 'react';
import type { StepRegistration } from '~/types.js';

import type { StepsProps } from './types.js';

export function useSteps({ step, steps }: StepsProps) {
    return React.useMemo(() => {
        if (steps.length === 0) {
            return {
                current: null,
                previous: null,
                next: null,
            };
        }

        const navigableSteps = steps.filter((s: StepRegistration) => s.fieldCount > 0);
        const currentIndex = navigableSteps.findIndex((s: StepRegistration) => s.order === step);

        const previousStep = currentIndex > 0 ? navigableSteps[currentIndex - 1] : null;
        const nextStep = currentIndex < navigableSteps.length - 1 ? navigableSteps[currentIndex + 1] : null;

        return {
            current: currentIndex,
            previous: previousStep?.order ?? null,
            next: nextStep?.order ?? null,
        };
    }, [step, steps]);
}
