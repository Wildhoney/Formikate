import type { FormikValues } from 'formik';
import * as React from 'react';

import type { FormikateReturn } from '~/types.js';

export const Context =
    React.createContext<null | FormikateReturn<FormikValues>>(null);

export const VirtualHiddenContext = React.createContext<
    React.RefObject<Set<string> | null>
>({ current: null });

export const internalState = Symbol('formikate.internalState');

export function useContext(): FormikateReturn<FormikValues> {
    const context = React.useContext(Context);
    if (!context) {
        throw new Error('useContext must be used within a Formikate Form');
    }
    return context;
}

export function useVirtualHidden(): React.RefObject<Set<string> | null> {
    return React.useContext(VirtualHiddenContext);
}
