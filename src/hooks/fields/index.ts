import { useLayoutEffect, useMemo, useState } from 'react';
import type { FormikValues } from 'formik';

import type { Formikate } from '../form/types.js';
import { config as formikateConfig } from '../form/utils.js';
import type { Config, Status, Step } from './types.js';
import {
    validate,
    getFieldState,
    getProgress,
    getNavigation,
} from './utils.js';

export type {
    Status,
    Config,
    Field,
    Step,
    Navigation,
    Progress,
} from './types.js';
export { Position } from './types.js';

/**
 * Declares the form's step and field structure, computing navigation, progress,
 * validation, and field visibility state. Writes the result to `form.status`.
 * @template Values - The form values shape extending `FormikValues`.
 * @template S - The step identifier type, inferred from the `steps` array in the config.
 * @param form - The `Formikate` instance returned by `useForm`.
 * @param getConfig - Factory function returning the current `Config` (steps and fields).
 * @returns {void}
 */
export function useFields<Values extends FormikValues, const S extends Step>(
    form: Formikate<Values>,
    getConfig: () => Config<S>,
): void {
    const [step, setStep] = useState<number>(0);
    const config = useMemo(() => getConfig(), [getConfig]);

    const steps = useMemo(
        () =>
            config.steps.filter((step) => {
                const fields = Object.values(config.fields).filter(
                    (field) => field.step === step,
                );
                return (
                    fields.length === 0 ||
                    fields.some((field) => field.active !== false)
                );
            }),
        [config],
    );

    const index = useMemo(
        () => Math.min(step, Math.max(0, steps.length - 1)),
        [step, steps],
    );
    const current = useMemo(() => steps[index], [steps, index]);

    useLayoutEffect(() => {
        for (const [name, field] of Object.entries(config.fields))
            if (field.active === false && form.values[name] !== field.value)
                form.setFieldValue(name, field.value);
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
                progress: getProgress(config.steps, steps, current, index),
                navigate: getNavigation(index, steps, setStep),
            }) satisfies Status,
        [config, steps, current, index],
    );

    // Direct mutation during render — runs before JSX evaluation. Using setStatus
    // would cause infinite re-render loops (config changes every render), and Formik's
    // cloneDeep strips Proxy-based defaults from initialStatus.
    // eslint-disable-next-line react-hooks/immutability
    (form as { status: Status }).status = status;
}
