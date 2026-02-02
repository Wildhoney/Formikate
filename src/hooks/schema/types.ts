import type { Fields, StepName, StepRegistration } from '~/types.js';

export type SchemaProps = {
    fields: Fields;
    step: StepName | null;
    steps: StepRegistration[];
};
