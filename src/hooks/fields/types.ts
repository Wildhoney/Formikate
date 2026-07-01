import type * as z from 'zod';

/** Identifier for a form step. Can be a string, number, or symbol. */
export type Step = string | number | symbol;

/**
 * Mode controls whether a field participates in the form at all.
 * - `Attached`: the field is part of the form — its value is submitted and (subject to the
 *   `hidden` flag) validated per the per-step rules.
 * - `Detached`: the field is not in the form — excluded from validation and reset to `value`.
 *
 * Use the `hidden` boolean on the field descriptor to control whether an attached field
 * renders in the UI. `Detached` fields are never rendered.
 *
 * At the step level, mode/hidden are derived from the step's fields:
 * - Any `Attached` field (or zero fields) → step is `Attached`.
 * - Otherwise → step is `Detached` (skipped in navigation).
 * - A step is "hidden" when every attached field on it is hidden — the step is skipped
 *   in navigation but its fields still validate on submit.
 */
export enum Mode {
    Attached = 'attached',
    Detached = 'detached',
}

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
export type Descriptor = {
    /** Which step this field belongs to. Must match one of the identifiers in `steps`. */
    step: Step;
    /** Zod schema used for validation. */
    validate: z.ZodType;
    /** Default/reset value for the field. Also used as the initial value when passed to `useForm`. */
    value: unknown;
    /** Whether this field participates in the form. Defaults to `Mode.Attached`. */
    mode?: Mode;
    /**
     * When `true` on an `Attached` field, the field is not rendered but its value is
     * still submitted and validated on every submit attempt. Ignored when `Detached`.
     */
    hidden?: boolean;
};

/**
 * Configuration object passed to `useFields` defining the form's step and field structure.
 * @template S - The step identifier type, inferred from the `steps` array.
 */
export type Config<S extends Step = Step> = {
    /** Ordered list of step identifiers. */
    steps: readonly S[];
    /** Map of field names to their configuration. */
    fields: Record<string, Omit<Descriptor, 'step'> & { step: NoInfer<S> }>;
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
    /** Predicate: is this step in the given mode? Mode is derived from the step's fields. */
    mode(value: Mode): boolean;
    /** Whether every attached field on this step is hidden. */
    hidden(): boolean;
    /** Whether the step is `Attached` and has at least one non-hidden field. */
    visible(): boolean;
    /** Whether this is the current step in the navigation flow. */
    active(): boolean;
    /** Names of attached, non-hidden field names on this step. */
    fields(): string[];
};

/** Per-field computed state returned by `form.status.field[name]`. */
export type Result = {
    /** Predicate: is this field in the given mode? */
    mode(value: Mode): boolean;
    /** Whether this field is attached but flagged as hidden. */
    hidden(): boolean;
    /** Whether this field is attached and not hidden — i.e. should render. */
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
