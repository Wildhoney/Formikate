import * as React from 'react';
import type { Fields } from '~/types.js';

import type { Field, VirtualField } from '~/types.js';
import { internalState, useContext } from '../../context/index.js';
import type { MutateProps } from './types.js';

function isVirtualField(field: Field | VirtualField): field is VirtualField {
    return (field as VirtualField).virtual === true;
}

export function useMutate(field: MutateProps) {
    const context = useContext();
    const state = React.useMemo(() => context[internalState], [context]);
    const dependency = JSON.stringify(
        isVirtualField(field) ? [field.virtual] : [field.name, field.validate],
    );

    React.useLayoutEffect(() => {
        state.setFields((fields: Fields) => {
            const exists = fields.find((f: Field) => f.name === field.name);

            return exists
                ? fields.map((x: Field) =>
                      x.name === field.name ? { ...x, ...field } : x,
                  )
                : [...fields, field];
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dependency]);
}
