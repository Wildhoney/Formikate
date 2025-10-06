import type { Fields, Step } from '~/types.js';

export type SchemaProps = {
    fields: Fields;
    step: Step | null;
    stepSequence: Step[];
    current: number | null;
};
