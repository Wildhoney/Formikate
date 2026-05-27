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
 * Field rendering and validation kinds.
 * - `Input`: rendered with UI; validated when the field's step is on or before the current step.
 * - `Hidden`: no UI; always validated. Errors fire `onInvalid` since the user can't recover.
 *
 * Combined with `null` (= inactive: not validated, value reset to default, no UI) to form the
 * full set of values accepted by a field's `mode` property.
 */
export const Field = {
    Input: 'input',
    Hidden: 'hidden',
} as const;

/** Accepted values for a field descriptor's `mode`. `null` means inactive. */
export type Mode = (typeof Field)[keyof typeof Field] | null;

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
            /**
             * How the field participates in the form. Defaults to `Field.Input`.
             * - `Field.Input`: UI rendered, validated when on/before the current step.
             * - `Field.Hidden`: no UI, always validated; errors fire `onInvalid`.
             * - `null`: inactive — excluded from validation and reset to `value`.
             */
            mode?: Mode;
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
export type Result = {
    /** Whether the field is rendered (mode is `Field.Input`). False for hidden and inactive fields. */
    exists(): boolean;
    /** Whether the Zod schema rejects `undefined` for this field. */
    required: boolean;
    /** Whether the Zod schema accepts `undefined` for this field. */
    optional: boolean;
    /** The configured mode of this field. */
    mode: Mode;
};

/** The computed state written to `form.status` by `useFields`. */
export type Status = {
    /** Whether the form has no fields and no steps configured. */
    empty: boolean;
    /** Map of field names to their computed state. */
    field: Record<string, Result>;
    /** Step progression state. */
    progress: Progress;
    /** Step navigation controls. */
    navigate: Navigation;
};
