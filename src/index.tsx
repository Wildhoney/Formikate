/* eslint-disable react-refresh/only-export-components */

import {
    FormikContext,
    useFormikContext,
    type FormikValues,
    type useFormik,
} from 'formik';
import type { ReactNode } from 'react';

import type { Formikate } from './hooks/form/types.js';
import type { Status } from './hooks/fields/types.js';

export { useForm } from './hooks/form/index.js';
export type { Props, Formikate } from './hooks/form/index.js';
export { useFields } from './hooks/fields/index.js';
export type {
    Status,
    Config,
    Field,
    Step,
    Navigation,
    Progress,
} from './hooks/fields/index.js';
export { Position } from './hooks/fields/index.js';

/**
 * Provides the Formikate form instance to child components via Formik's context.
 * @template Values - The form values shape extending `FormikValues`.
 */
export function Form<Values extends FormikValues>({
    value,
    children,
}: {
    value: Formikate<Values>;
    children: ReactNode;
}): ReactNode {
    return (
        <FormikContext value={value as unknown as ReturnType<typeof useFormik>}>
            {children}
        </FormikContext>
    );
}

/**
 * Typed wrapper around Formik's `useFormikContext`. Returns the form instance
 * with a properly typed `status` property.
 * @template Values - The form values shape extending `FormikValues`.
 */
export function useFormContext<Values extends FormikValues>() {
    return useFormikContext<Values>() as unknown as Omit<
        ReturnType<typeof useFormik<Values>>,
        'status'
    > & { status: Status };
}
