import type { Fields, StepName } from '~/types.js';
import type { FormikValues, useFormik } from 'formik';

export type ConfigProps<Values extends FormikValues> = {
    current: number | null;
    fields: Fields;
    form: ReturnType<typeof useFormik<Values>>;
    next: StepName | null;
    previous: StepName | null;
    step: StepName | null;
    stepSequence: StepName[];
    setStep: React.Dispatch<React.SetStateAction<StepName | null>>;
    setFields: React.Dispatch<React.SetStateAction<Fields>>;
};
