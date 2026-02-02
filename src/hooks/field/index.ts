import * as React from 'react';
import * as z from 'zod';

import type { Field, VirtualField } from '~/types.js';

type FieldInput<T> = (Field<T> | VirtualField) & { stepOrder?: number | null };

function isVirtualField<T>(
    field: FieldInput<T>,
): field is VirtualField & { stepOrder?: number | null } {
    return (field as VirtualField).virtual === true;
}

export function useField<T>(field: FieldInput<T>): Field<T> {
    const id = React.useId();

    return React.useMemo(
        () =>
            isVirtualField(field)
                ? {
                      name: `formikate-virtual-field-${id}`,
                      validate: z.any(),
                      stepOrder: field.stepOrder,
                  }
                : field,
        [field, id],
    );
}
