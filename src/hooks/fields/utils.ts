import { toFormikValidate } from 'zod-formik-adapter';
import * as z from 'zod';
import type { Config, Result, Status, Step, StepResult } from './types.js';
import { Cursor } from './types.js';

/**
 * A step is excluded when it has at least one field and every field on it is
 * `excluded: true`. Steps with no fields are always included.
 */
export function getStepExcluded(step: Step, fields: Config['fields']): boolean {
    const stepFields = Object.values(fields).filter(
        (field) => field.step === step,
    );
    if (stepFields.length === 0) return false;
    return stepFields.every((field) => field.excluded === true);
}

/**
 * A step is "hidden" when every included field on it is `hidden: true`. Steps with no
 * fields or any non-hidden included field are not hidden. Excluded steps are not
 * considered hidden (they're absent, not hidden).
 */
export function getStepHidden(step: Step, fields: Config['fields']): boolean {
    const included = Object.values(fields).filter(
        (field) => field.step === step && field.excluded !== true,
    );
    if (included.length === 0) return false;
    return included.every((field) => field.hidden === true);
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
        step: {},
        progress: {
            steps: () => [],
            total: () => 0,
            current: () => '' as Step,
            position: () => 0,
            first: () => true,
            last: () => true,
        },
        navigate: {
            to: () => {},
            possible: () => false,
        },
    };
}

/**
 * Validates form values against the Zod schemas of fields that are in scope for the current step.
 * Hidden attached fields are always in scope. Non-hidden attached fields are in scope when
 * their step is on or before the current step. Detached fields are excluded.
 */
export function validate(
    values: Record<string, unknown>,
    getConfig: () => Config,
    index: number,
) {
    const config = getConfig();

    const visibleSteps = config.steps.filter(
        (step) =>
            !getStepExcluded(step, config.fields) &&
            !getStepHidden(step, config.fields),
    );

    const includedFields = Object.entries(config.fields).filter(([, field]) => {
        if (field.excluded === true) return false;
        if (field.hidden === true) return true;
        const fieldStepIndex = visibleSteps.indexOf(field.step);
        return fieldStepIndex !== -1 && fieldStepIndex <= index;
    });

    const schemaShape = Object.fromEntries(
        includedFields.map(([name, field]) => [name, field.validate]),
    );

    return toFormikValidate(z.object(schemaShape))(values);
}

/**
 * Computes per-field state from the field configuration and Zod schemas.
 */
export function getFieldState(
    fields: Config['fields'],
): Record<string, Result> {
    const state: Record<string, Result> = {};
    for (const [name, field] of Object.entries(fields)) {
        const isExcluded = field.excluded === true;
        const isHidden = !isExcluded && field.hidden === true;
        const isOptional = field.validate.safeParse(undefined).success;
        state[name] = {
            included: () => !isExcluded,
            excluded: () => isExcluded,
            hidden: () => isHidden,
            visible: () => !isExcluded && !isHidden,
            required: () => !isOptional,
            optional: () => isOptional,
            descriptor: field,
        };
    }
    return state;
}

/**
 * Builds the per-step computed state map exposed as `form.status.step`.
 */
export function getStepState(
    allSteps: readonly Step[],
    currentStepId: Step,
    fields: Config['fields'],
): Record<Step, StepResult> {
    const inputsByStep: Record<Step, string[]> = {};
    for (const [name, field] of Object.entries(fields)) {
        if (field.excluded === true) continue;
        if (field.hidden === true) continue;
        (inputsByStep[field.step] ??= []).push(name);
    }

    const step: Record<Step, StepResult> = {};
    for (const stepId of allSteps) {
        const stepExcluded = getStepExcluded(stepId, fields);
        const stepHidden = getStepHidden(stepId, fields);
        const stepFields = inputsByStep[stepId] ?? [];
        step[stepId] = {
            included: () => !stepExcluded,
            excluded: () => stepExcluded,
            hidden: () => stepHidden,
            visible: () => !stepExcluded && !stepHidden,
            active: () => stepId === currentStepId,
            fields: () => stepFields,
        };
    }
    return step;
}

/**
 * Builds the progress metrics from visible steps.
 */
export function getProgress(
    visibleSteps: readonly Step[],
    currentStepId: Step,
    index: number,
) {
    const stepList = visibleSteps.map((id, position) => ({
        id,
        index: position,
    }));
    return {
        steps: () => stepList,
        total: () => visibleSteps.length,
        current: () => currentStepId,
        position: () => index,
        first: () => index === 0,
        last: () => index === visibleSteps.length - 1,
    };
}

/**
 * Creates navigation controls for moving between visible steps. Targets may be a step
 * identifier or a `Cursor` enum value (Next, Previous, First, Last).
 */
export function getNavigation(
    index: number,
    steps: readonly Step[],
    setStep: (index: number) => void,
) {
    function resolve(target: Step | Cursor): number {
        switch (target) {
            case Cursor.Next:
                return index + 1;
            case Cursor.Previous:
                return index - 1;
            case Cursor.First:
                return 0;
            case Cursor.Last:
                return steps.length - 1;
            default:
                return steps.indexOf(target);
        }
    }

    return {
        to: (target: Step | Cursor) => {
            const i = resolve(target);
            if (i >= 0 && i < steps.length) setStep(i);
        },
        possible: (target: Step | Cursor) => {
            const i = resolve(target);
            return i >= 0 && i < steps.length;
        },
    };
}
