import type { StepName, StepRegistration, Fields } from '~/types.js';

export type StepsProps = {
    step: StepName | null;
    steps: StepRegistration[];
    fields: Fields;
};
