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
        const wasHidden =
            field.step != null && field.hidden.current?.has(String(field.step));

        if (field.default !== undefined && !wasHidden)
            form.setFieldValue(field.name, field.default);

        state.setFields((fields: Fields) => [
            ...fields.filter((f: Field) => f.name !== field.name),
            field,
        ]);

        return () => {
            // Check if this field's step is in the hidden steps set
            // This means a parent virtual field is hiding, so don't deregister
            const hidden =
                field.step != null &&
                field.hidden.current?.has(String(field.step));

            if (hidden) {
                return;
            }

            const rollback =
                field.default !== undefined
                    ? field.default
                    : getIn(form.initialValues, field.name);
            form.setFieldValue(field.name, rollback);
            state.setFields((fields: Fields) =>
                fields.filter((f: Field) => f.name !== field.name),
            );
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
