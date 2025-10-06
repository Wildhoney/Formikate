import type { Fields, Step } from '~/types.js';
import type { FormikValues, useFormik } from 'formik';

export type ConfigProps<Values extends FormikValues> = {
    current: number | null;
    fields: Fields;
    form: ReturnType<typeof useFormik<Values>>;
    next: Step | null;
    previous: Step | null;
    step: Step | null;
    stepSequence: Step[];
    setStep: React.Dispatch<React.SetStateAction<Step | null>>;
    setFields: React.Dispatch<React.SetStateAction<Fields>>;
};
