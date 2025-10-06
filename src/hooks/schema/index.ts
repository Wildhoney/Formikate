import { useMemo } from 'react';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import * as z from 'zod';
import type { SchemaProps } from './types.js';

export function useSchema({
    fields,
    step,
    stepSequence,
    current,
}: SchemaProps) {
    return useMemo(() => {
        const filteredFields = fields.filter((field) => {
            if (step == null) return true;
            const fieldStep = stepSequence.findIndex((x) => x === field.step);
            return fieldStep !== -1 && fieldStep <= (current ?? 0);
        });

        const validationSchema = filteredFields.reduce<
            Record<string, z.ZodTypeAny>
        >((acc, field) => ({ ...acc, [field.name]: field.validate }), {});

        return toFormikValidationSchema(z.object(validationSchema));
    }, [fields, step, stepSequence, current]);
}
