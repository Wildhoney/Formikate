import type * as z from 'zod';

/** Identifier for a form step. Can be a string, number, or symbol. */
export type Step = string | number | symbol;

/** Predefined navigation targets for moving between steps. */
export const enum Position {
    /** Move to the next visible step. */
    Next,
    /** Move to the previous visible step. */
    Previous,
    /** Jump to the first visible step. */
    First,
    /** Jump to the last visible step. */
    Last,
}

/**
 * Configuration object passed to `useFields` defining the form's step and field structure.
 * @template S - The step identifier type, inferred from the `steps` array.
 */
export type Config<S extends Step = Step> = {
    /** Ordered list of step identifiers. */
    steps: readonly S[];
    /** Map of field names to their configuration. */
    fields: Record<
        string,
        {
            /** Which step this field belongs to. Must match one of the identifiers in `steps`. */
            step: NoInfer<S>;
            /** Zod schema used for validation. */
            validate: z.ZodType;
            /** Default/reset value for the field. Also used as the initial value when passed to `useForm`. */
            value: unknown;
            /** Whether the field is active (default `true`). Inactive fields are excluded from validation and reset to `value`. */
            active?: boolean;
        }
    >;
};

/** Controls step navigation. Accepts a step identifier or a `Position` enum value. */
export type Navigation = {
    /** Navigate to a specific step or a relative position (Next, Previous, First, Last). */
    to(target: Step | Position): void;
    /** Check whether a navigation target is reachable. */
    exists(target: Step | Position): boolean;
};

/** Tracks the form's step progression, including which steps are visible and which is current. */
export type Progress = {
    /** Ordered list of visible steps with their indices. */
    steps: { id: Step; index: number }[];
    /** Map of step identifiers to their visibility and current state. */
    step: Record<Step, { visible: boolean; current: boolean }>;
    /** Total number of visible steps. */
    total: number;
    /** Identifier of the current step. */
    current: Step;
    /** Zero-based index of the current step within visible steps. */
    position: number;
    /** Whether the current step is the first visible step. */
    first: boolean;
    /** Whether the current step is the last visible step. */
    last: boolean;
};

/** Per-field computed state returned by `form.status.field`. */
export type Field = {
    /** Whether the field is active and present in the form. */
    exists(): boolean;
    /** Whether the Zod schema rejects `undefined` for this field. */
    required: boolean;
    /** Whether the Zod schema accepts `undefined` for this field. */
    optional: boolean;
};

/** The computed state written to `form.status` by `useFields`. */
export type Status = {
    /** Whether the form has no fields and no steps configured. */
    empty: boolean;
    /** Map of field names to their computed state. */
    field: Record<string, Field>;
    /** Step progression state. */
    progress: Progress;
    /** Step navigation controls. */
    navigate: Navigation;
};
