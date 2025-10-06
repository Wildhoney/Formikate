import * as React from 'react';
import * as z from 'zod';

import type { Field, VirtualField } from '~/types.js';

function isVirtualField(field: Field | VirtualField): field is VirtualField {
    return (field as VirtualField).virtual === true;
}

export function useField(field: Field | VirtualField): Field {
    const id = React.useId();

    return React.useMemo(
        () =>
            isVirtualField(field)
                ? {
                      name: `formikate-virtual-field-${id}`,
                      // Virtual fields do not have a validation schema, so we use z.any().
                      validate: z.any(),
                      ...field,
                  }
                : field,
        [field, id],
    );
}
