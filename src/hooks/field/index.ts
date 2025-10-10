import * as React from 'react';
import * as z from 'zod';

import type { Field, VirtualField } from '~/types.js';

function isVirtualField<T>(
    field: Field<T> | VirtualField,
): field is VirtualField {
    return (field as VirtualField).virtual === true;
}

export function useField<T>(field: Field<T> | VirtualField): Field<T> {
    const id = React.useId();

    return React.useMemo(
        () =>
            isVirtualField(field)
                ? {
                      name: `formikate-virtual-field-${id}`,
                      validate: z.any(),
                      ...field,
                  }
                : field,
        [field, id],
    );
}
