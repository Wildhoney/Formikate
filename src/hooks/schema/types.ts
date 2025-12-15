import type { Fields, StepName } from '~/types.js';

export type SchemaProps = {
    fields: Fields;
    step: StepName | null;
    stepSequence: StepName[];
    current: number | null;
};
