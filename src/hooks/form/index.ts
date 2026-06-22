import { useRef, useCallback, useEffect } from 'react';
import { useFormik, type FormikValues } from 'formik';

import type { Props, Formikate } from './types.js';
import { config } from './utils.js';
import { getDefaultStatus } from '../fields/utils.js';

export type { Props, Formikate } from './types.js';

/**
 * Thin wrapper around Formik's `useFormik` that derives initial values from field
 * descriptors and adds a validation ref so `useFields` can inject per-step validation.
 * Also invokes the optional `onInvalid` callback when a submit attempt is blocked by
 * a hidden field's validation error — the user has no UI to recover from those.
 * Errors on visible fields are surfaced inline (or handled by the consumer's nav-back logic).
 * @template Values - The form values shape extending `FormikValues`.
 * @param props - Formik configuration with `fields` instead of `initialValues`.
 * @returns {Formikate<Values>} The Formik instance with typed status and internal state.
 */
export function useForm<Values extends FormikValues>(
    props: Props<Values>,
): Formikate<Values> {
    const { fields, onInvalid, ...rest } = props;

    const initialValues = Object.fromEntries(
        Object.entries(fields).map(([name, descriptor]) => [
            name,
            descriptor.value,
        ]),
    ) as Values;

    const validateRef = useRef<((values: Values) => unknown) | null>(null);

    const validate = useCallback(
        (values: Values) => validateRef.current?.(values) ?? {},
        [],
    );

    const form = useFormik<Values>({
        ...rest,
        initialValues,
        validate,
        initialStatus: getDefaultStatus(),
    });
    // eslint-disable-next-line react-hooks/immutability
    (form as unknown as Formikate<Values>)[config.validate] = validateRef;

    const lastSubmitCount = useRef(0);

    useEffect(() => {
        if (form.submitCount === lastSubmitCount.current) return;
        if (form.isSubmitting) return;
        lastSubmitCount.current = form.submitCount;
        const hasHiddenError = Object.keys(form.errors).some(
            (name) => form.status.field[name]?.hidden() ?? false,
        );
        if (hasHiddenError) onInvalid?.(form.errors);
    }, [
        form.submitCount,
        form.isSubmitting,
        form.errors,
        form.status,
        onInvalid,
    ]);

    return form as unknown as Formikate<Values>;
}
