import { useRef, useCallback, useEffect } from 'react';
import { useFormik, type FormikValues } from 'formik';

import type { Props, Formikate } from './types.js';
import { config } from './utils.js';
import { getDefaultStatus } from '../fields/utils.js';

export type { Props, Formikate } from './types.js';

/**
 * Thin wrapper around Formik's `useFormik` that derives initial values from field
 * descriptors and adds a validation ref so `useFields` can inject per-step validation.
 * Also invokes the optional `onInvalid` callback whenever a submit attempt is blocked
 * by validation, passing a map of invalid fields keyed by name where each entry is
 * the raw `Descriptor` (from `useFields`) plus the validation `error` message —
 * giving the consumer the `step`, `mode`, and `hidden` context needed to toast,
 * navigate, or log.
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
        const names = Object.keys(form.errors);
        if (names.length === 0) return;
        const payload = Object.fromEntries(
            names.flatMap((name) => {
                const descriptor = form.status.field[name]?.descriptor;
                if (!descriptor) return [];
                return [
                    [name, { ...descriptor, error: String(form.errors[name]) }],
                ];
            }),
        ) as Parameters<NonNullable<typeof onInvalid>>[0];
        onInvalid?.(payload);
    }, [
        form.submitCount,
        form.isSubmitting,
        form.errors,
        form.status,
        onInvalid,
    ]);

    return form as unknown as Formikate<Values>;
}
