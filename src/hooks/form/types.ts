import type { FormikConfig, FormikValues, useFormik } from 'formik';
import type { config } from './utils.js';
import type { Status as FieldsStatus, Descriptor } from '../fields/types.js';

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
    /**
     * Called when a submit attempt is blocked by validation errors. Receives a map
     * keyed by field name where each entry is that field's `Descriptor` (as passed
     * to `useFields`) augmented with the validation `error` message. Only invalid
     * fields are included. Use `errors.<name>.hidden` to identify the "no UI to
     * recover" case, `errors.<name>.step` to navigate to the offending step, or
     * simply iterate `Object.values(errors)` for a toast.
     */
    onInvalid?: (errors: {
        [K in keyof Values]?: Descriptor & { error: string };
    }) => void;
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
