import { useLayoutEffect, useMemo, useState } from 'react';
import type { FormikValues } from 'formik';

import type { Formikate } from '../form/types.js';
import { config as formikateConfig } from '../form/utils.js';
import type { Config, Status, Step } from './types.js';
import { Mode } from './types.js';
import {
    validate,
    getFieldState,
    getMode,
    getStepMode,
    getStepHidden,
    getProgress,
    getStepState,
    getNavigation,
} from './utils.js';

export type {
    Status,
    Config,
    Result,
    StepResult,
    Step,
    Navigation,
    Progress,
    Descriptor,
} from './types.js';
export { Mode, Cursor } from './types.js';

/**
 * Declares the form's step and field structure, computing navigation, progress,
 * validation, and field visibility state. Writes the result to `form.status`.
 */
export function useFields<Values extends FormikValues, const S extends Step>(
    form: Formikate<Values>,
    getConfig: () => Config<S>,
): void {
    const [stepIndex, setStepIndex] = useState<number>(0);
    const config = useMemo(() => getConfig(), [getConfig]);

    const visibleSteps = useMemo(
        () =>
            config.steps.filter(
                (step) =>
                    getStepMode(step, config.fields) === Mode.Attached &&
                    !getStepHidden(step, config.fields),
            ),
        [config],
    );

    const index = useMemo(
        () => Math.min(stepIndex, Math.max(0, visibleSteps.length - 1)),
        [stepIndex, visibleSteps],
    );
    const current = useMemo(() => visibleSteps[index], [visibleSteps, index]);

    useLayoutEffect(() => {
        for (const [name, field] of Object.entries(config.fields)) {
            const mode = getMode(field.mode);
            if (mode === Mode.Detached) {
                if (form.values[name] !== field.value)
                    form.setFieldValue(name, field.value);
                continue;
            }
            if (!(name in form.values))
                form.setFieldValue(name, field.value);
        }
    }, [form, config.fields]);

    useLayoutEffect(() => {
        // eslint-disable-next-line react-hooks/immutability
        form[formikateConfig.validate].current = (values: Values) =>
            validate(values as Record<string, unknown>, getConfig, index);
    }, [form, getConfig, index]);

    const status = useMemo(
        () =>
            ({
                empty:
                    config.steps.length === 0 &&
                    Object.keys(config.fields).length === 0,
                field: getFieldState(config.fields),
                step: getStepState(config.steps, current, config.fields),
                progress: getProgress(visibleSteps, current, index),
                navigate: getNavigation(index, visibleSteps, setStepIndex),
            }) satisfies Status,
        [config, visibleSteps, current, index],
    );

    // Direct mutation during render — runs before JSX evaluation. Using setStatus
    // would cause infinite re-render loops (config changes every render), and Formik's
    // cloneDeep strips Proxy-based defaults from initialStatus.
    // eslint-disable-next-line react-hooks/immutability
    (form as { status: Status }).status = status;
}
