import type { FormikValues } from 'formik';
import * as React from 'react';

import type { FormikateReturn } from '~/types.js';

export const Context =
    React.createContext<null | FormikateReturn<FormikValues>>(null);

export const FieldNestingContext = React.createContext<boolean>(false);

export const StepNestingContext = React.createContext<boolean>(false);

export const CurrentStepContext = React.createContext<number | null>(null);

export const internalState = Symbol('formikate.internalState');

export function useContext(): FormikateReturn<FormikValues> {
    const context = React.useContext(Context);
    if (!context) {
        throw new Error('useContext must be used within a Formikate Form');
    }
    return context;
}
