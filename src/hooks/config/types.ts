import type { Fields, StepName, StepRegistration } from '~/types.js';
import type { FormikValues, useFormik } from 'formik';

export type ConfigProps<Values extends FormikValues> = {
    current: number | null;
    fields: Fields;
    form: ReturnType<typeof useFormik<Values>>;
    next: StepName | null;
    previous: StepName | null;
    step: StepName | null;
    steps: StepRegistration[];
    setStep: React.Dispatch<React.SetStateAction<StepName | null>>;
    setFields: React.Dispatch<React.SetStateAction<Fields>>;
    registerStep: (step: StepRegistration, reactId: string) => void;
    unregisterStep: (reactId: string) => void;
    incrementStepFieldCount: (stepOrder: number) => void;
    decrementStepFieldCount: (stepOrder: number) => void;
};
