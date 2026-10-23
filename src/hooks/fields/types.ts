import type * as z from 'zod';

/** Identifier for a form step. Can be a string, number, or symbol. */
export type Step = string | number | symbol;

/**
 * Relative navigation targets. Pass to `navigate.to` / `navigate.exists` to move within
 * the visible step list without referencing a step identifier directly.
 */
export const enum Cursor {
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
 * Raw field configuration — the shape consumers write when defining a form's fields.
 * The `step` identifier is loosely typed as `Step` here; `Config<S>` narrows it via a
 * generic parameter for stronger inference inside `useFields`.
 */
export type Descriptor<
    T extends z.ZodType = z.ZodType,
    S extends Step = Step,
> = {
    /** Which step this field belongs to. Must match one of the identifiers in `steps`. */
    step: S;
    /** Zod schema used for validation. */
    validate: T;
    /**
     * Initial value for the field, typed from the `validate` schema (or `null`/`undefined`).
     * Also used as the reset value when the field is `Detached`.
     */
    initial: z.infer<T> | null | undefined;
    /**
     * When `true`, the field is left out of the form entirely — excluded from validation
     * and reset to `initial`. Defaults to `false`. A step whose fields are all excluded is
     * skipped in navigation; a step with no fields is never excluded.
     */
    excluded?: boolean;
    /**
     * When `true` on an included field, the field is not rendered but its value is
     * still submitted and validated on every submit attempt. Ignored when `excluded`.
     * A step whose included fields are all hidden is skipped in navigation.
     */
    hidden?: boolean;
};

/**
 * Configuration object passed to `useFields` defining the form's step and field structure.
 * @template S - The step identifier type, inferred from the `steps` array.
 * @template F - Map of field names to Zod schemas, inferred from each field's `validate`.
 */
export type Config<
    S extends Step = Step,
    F extends Record<string, z.ZodType> = Record<string, z.ZodType>,
> = {
    /** Ordered list of step identifiers. */
    steps: readonly S[];
    /** Map of field names to their configuration. */
    fields: { [K in keyof F]: Descriptor<F[K], NoInfer<S>> };
};

/** Controls step navigation. Accepts a step identifier or a `Cursor` enum value. */
export type Navigation = {
    /** Navigate to a specific step or a relative cursor (Next, Previous, First, Last). */
    to(target: Step | Cursor): void;
    /** Whether a navigation target is reachable. */
    possible(target: Step | Cursor): boolean;
};

/** Tracks the form's step progression. */
export type Progress = {
    /** Ordered list of visible steps with their indices. */
    steps(): { id: Step; index: number }[];
    /** Total number of visible steps. */
    total(): number;
    /** Identifier of the current step. */
    current(): Step;
    /** Zero-based index of the current step within visible steps. */
    position(): number;
    /** Whether the current step is the first visible step. */
    first(): boolean;
    /** Whether the current step is the last visible step. */
    last(): boolean;
};

/** Per-step computed state returned by `form.status.step[id]`. */
export type StepResult = {
    /** Whether this step has no fields or at least one included field. */
    included(): boolean;
    /** Whether this step has fields and every one of them is excluded. */
    excluded(): boolean;
    /** Whether every included field on this step is hidden. */
    hidden(): boolean;
    /** Whether the step is included and has at least one non-hidden field. */
    visible(): boolean;
    /** Whether this is the current step in the navigation flow. */
    active(): boolean;
    /** Names of included, non-hidden fields on this step. */
    fields(): string[];
};

/** Per-field computed state returned by `form.status.field[name]`. */
export type Result = {
    /** Whether this field participates in the form (not `excluded`). */
    included(): boolean;
    /** Whether this field is `excluded` from the form. */
    excluded(): boolean;
    /** Whether this field is included but flagged as hidden. */
    hidden(): boolean;
    /** Whether this field is included and not hidden — i.e. should render. */
    visible(): boolean;
    /** Whether the Zod schema rejects `undefined` for this field. */
    required(): boolean;
    /** Whether the Zod schema accepts `undefined` for this field. */
    optional(): boolean;
    /** The raw descriptor supplied by the consumer — reflects the latest `useFields` config. */
    descriptor: Descriptor;
};

/** The computed state written to `form.status` by `useFields`. */
export type Status = {
    /** Whether the form has no fields and no steps configured. */
    empty: boolean;
    /** Map of field names to their computed state. */
    field: Record<string, Result>;
    /** Map of step identifiers to their computed state. */
    step: Record<Step, StepResult>;
    /** Step progression state. */
    progress: Progress;
    /** Step navigation controls. */
    navigate: Navigation;
};
