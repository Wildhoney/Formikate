import { useMemo } from 'react';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import * as z from 'zod';
import type { SchemaProps } from './types.js';

export function useSchema({ fields, step, steps }: SchemaProps) {
    return useMemo(() => {
        const currentStepOrder = step;

        const filteredFields = fields.filter((field) => {
            if (currentStepOrder == null) return true;
            if (field.stepOrder == null) return true;

            const fieldStepIndex = steps.findIndex((s) => s.order === field.stepOrder);
            const currentStepIndex = steps.findIndex((s) => s.order === currentStepOrder);

            return fieldStepIndex !== -1 && fieldStepIndex <= currentStepIndex;
        });

        const validationSchema = filteredFields.reduce<
            Record<string, z.ZodTypeAny>
        >((acc, field) => ({ ...acc, [field.name]: field.validate }), {});

        return toFormikValidationSchema(z.object(validationSchema));
    }, [fields, step, steps]);
}
