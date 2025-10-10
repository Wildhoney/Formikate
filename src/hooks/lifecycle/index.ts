import { getIn, useFormikContext } from 'formik';
import * as React from 'react';
import type { Fields, Field } from '~/types.js';

import { internalState, useContext } from '../../context/index.js';
import type { LifecycleProps } from './types.js';

export function useLifecycle<T>(field: LifecycleProps<T>) {
    const context = useContext();
    const form = useFormikContext();
    const state = React.useMemo(() => context[internalState], [context]);

    React.useLayoutEffect(() => {
        if (field.default !== undefined) {
            form.setFieldValue(field.name, field.default);
        }

        state.setFields((fields: Fields) => [
            ...fields.filter((f: Field) => f.name !== field.name),
            field,
        ]);

        return () => {
            const resetValue =
                field.default !== undefined
                    ? field.default
                    : getIn(form.initialValues, field.name);
            form.setFieldValue(field.name, resetValue);
            state.setFields((fields: Fields) =>
                fields.filter((f: Field) => f.name !== field.name),
            );
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
