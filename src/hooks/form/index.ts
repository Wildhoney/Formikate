import { useRef, useCallback } from 'react';
import { useFormik, type FormikValues } from 'formik';

import type { Props, Formikate } from './types.js';
import { config } from './utils.js';
import { getDefaultStatus } from '../fields/utils.js';

export type { Props, Formikate } from './types.js';

/**
 * Thin wrapper around Formik's `useFormik` that derives initial values from field
 * descriptors and adds a validation ref so `useFields` can inject per-step validation.
 * @template Values - The form values shape extending `FormikValues`.
 * @param props - Formik configuration with `fields` instead of `initialValues`.
 * @returns {Formikate<Values>} The Formik instance with typed status and internal state.
 */
export function useForm<Values extends FormikValues>(
    props: Props<Values>,
): Formikate<Values> {
    const { fields, ...rest } = props;

    const initialValues = Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [k, v.value]),
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

    return form as unknown as Formikate<Values>;
}
