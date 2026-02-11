import type { FormikConfig, FormikValues, useFormik } from 'formik';
import type { config } from './utils.js';
import type { Status as FieldsStatus } from '../fields/types.js';

/**
 * Formik configuration with `validate`, `validationSchema`, and `initialValues` omitted.
 * Initial values are derived from the `value` property of each entry in `fields`.
 * @template Values - The form values shape extending `FormikValues`.
 */
export type Props<Values extends FormikValues> = Omit<
    FormikConfig<Values>,
    'validate' | 'validationSchema' | 'initialValues'
> & {
    /** Map of field names to descriptors containing at least a `value` property. */
    fields: {
        [K in keyof Values]: { value: Values[K]; [key: string]: unknown };
    };
};

/**
 * The return type of `useForm`. Extends Formik's return type with a typed `status`
 * and an internal validation ref used by `useFields` to inject per-step validation.
 * @template Values - The form values shape extending `FormikValues`.
 */
export type Formikate<Values extends FormikValues> = Omit<
    ReturnType<typeof useFormik<Values>>,
    'status'
> & {
    status: FieldsStatus;
    [config.validate]: React.RefObject<((values: Values) => unknown) | null>;
};
