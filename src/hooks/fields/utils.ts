import { toFormikValidate } from 'zod-formik-adapter';
import * as z from 'zod';
import type { Config, Mode, Result, Status, Step } from './types.js';
import { Field, Position } from './types.js';

/** Resolves a field descriptor's `mode`, defaulting to `Field.Input` when undefined. */
export function getMode(mode: Mode | undefined): Mode {
    return mode === undefined ? Field.Input : mode;
}

/**
 * Returns a safe default `Status` used as Formik's `initialStatus`.
 * Note: Formik's `cloneDeep` strips Proxy handlers, so `useFields` must also
 * assign `form.status` directly during render to ensure correct data before JSX evaluation.
 */
export function getDefaultStatus(): Status {
    return {
        empty: true,
        field: {},
        progress: {
            steps: [],
            step: {},
            total: 0,
            current: '' as Step,
            position: 0,
            first: true,
            last: true,
        },
        navigate: {
            to: () => {},
            exists: () => false,
        },
    };
}

/**
 * Validates form values against the Zod schemas of fields that are in scope for the current step.
 * `Field.Hidden` fields are always in scope. `Field.Input` fields are in scope when their step
 * is on or before the current step. Inactive (`null`) fields are excluded.
 * @param values - The current form values to validate.
 * @param getConfig - Factory function returning the latest `Config`.
 * @param index - The zero-based index of the current visible step.
 * @returns {Record<string, string>} A map of field names to error messages, or an empty object if valid.
 */
export function validate(
    values: Record<string, unknown>,
    getConfig: () => Config,
    index: number,
) {
    const config = getConfig();

    const steps = config.steps.filter((step) => {
        const stepFields = Object.values(config.fields).filter(
            (field) => field.step === step,
        );
        if (stepFields.length === 0) return true;
        return stepFields.some(
            (field) => getMode(field.mode) === Field.Input,
        );
    });

    const includedFields = Object.entries(config.fields).filter(
        ([, field]) => {
            const mode = getMode(field.mode);
            if (mode === null) return false;
            if (mode === Field.Hidden) return true;
            const fieldStepIdx = steps.indexOf(field.step);
            return fieldStepIdx !== -1 && fieldStepIdx <= index;
        },
    );

    const schemaShape = Object.fromEntries(
        includedFields.map(([name, field]) => [name, field.validate]),
    );

    return toFormikValidate(z.object(schemaShape))(values);
}

/**
 * Computes per-field state from the field configuration and Zod schemas.
 * @param fields - The field configuration map from `Config['fields']`.
 * @returns {Record<string, Result>} A map of field names to their computed state.
 */
export function getFieldState(
    fields: Config['fields'],
): Record<string, Result> {
    const state: Record<string, Result> = {};
    for (const [name, field] of Object.entries(fields)) {
        const mode = getMode(field.mode);
        const optional = field.validate.safeParse(undefined).success;
        state[name] = {
            exists: () => mode === Field.Input,
            required: !optional,
            optional,
            mode,
        };
    }
    return state;
}

/**
 * Builds the step map and progress metrics from visible steps.
 * @param allSteps - The full ordered list of step identifiers from the config.
 * @param visibleSteps - The filtered list of steps that have at least one active field.
 * @param currentStepId - The identifier of the currently active step.
 * @param index - The zero-based index of the current step within visible steps.
 * @returns {import('./types.js').Progress} The computed progress state.
 */
export function getProgress(
    allSteps: readonly Step[],
    visibleSteps: readonly Step[],
    currentStepId: Step,
    index: number,
) {
    const step: Record<Step, { visible: boolean; current: boolean }> = {};
    for (const s of allSteps) {
        step[s] = {
            visible: visibleSteps.includes(s),
            current: s === currentStepId,
        };
    }

    return {
        steps: visibleSteps.map((id, i) => ({ id, index: i })),
        step,
        total: visibleSteps.length,
        current: currentStepId,
        position: index,
        first: index === 0,
        last: index === visibleSteps.length - 1,
    };
}

/**
 * Creates navigation controls for moving between visible steps.
 * @param index - The zero-based index of the current step within visible steps.
 * @param steps - The filtered list of visible step identifiers.
 * @param setStep - State setter to update the current step index.
 * @returns {import('./types.js').Navigation} An object with `to` and `exists` methods for step navigation.
 */
export function getNavigation(
    index: number,
    steps: readonly Step[],
    setStep: (index: number) => void,
) {
    function resolve(target: Step | Position): number {
        switch (target) {
            case Position.Next:
                return index + 1;
            case Position.Previous:
                return index - 1;
            case Position.First:
                return 0;
            case Position.Last:
                return steps.length - 1;
            default:
                return steps.indexOf(target);
        }
    }

    return {
        to: (target: Step | Position) => {
            const i = resolve(target);
            if (i >= 0 && i < steps.length) setStep(i);
        },
        exists: (target: Step | Position) => {
            const i = resolve(target);
            return i >= 0 && i < steps.length;
        },
    };
}
