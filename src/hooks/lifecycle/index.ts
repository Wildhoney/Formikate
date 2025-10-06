import { getIn, useFormikContext } from 'formik';
import * as React from 'react';
import type { Fields, Field } from '~/types.js';

import { internalState, useContext } from '../../context/index.js';
import type { LifecycleProps } from './types.js';

export function useLifecycle(field: LifecycleProps) {
    const context = useContext();
    const form = useFormikContext();
    const state = React.useMemo(() => context[internalState], [context]);

    React.useLayoutEffect(() => {
        state.setFields((fields: Fields) => [
            ...fields.filter((f: Field) => f.name !== field.name),
            field,
        ]);

        return () => {
            form.setFieldValue(
                field.name,
                getIn(form.initialValues, field.name),
            );
            state.setFields((fields: Fields) =>
                fields.filter((f: Field) => f.name !== field.name),
            );
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
