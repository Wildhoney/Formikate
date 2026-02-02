import type { Field } from '~/types.js';

export type LifecycleProps<T = unknown> = Field<T> & {
    initial?: T;
};
