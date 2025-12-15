import type { FormikConfig, FormikValues, useFormik } from 'formik';
import * as z from 'zod';
import type { internalState } from './context/index.js';
import type { ReactNode } from 'react';

export type StepName = string | number;
export type FieldName = string;

export type FormikateProps<Values extends FormikValues> = Omit<
    FormikConfig<Values>,
    'validate' | 'validationSchema'
> & {
    initialStep?: null | StepName;
    stepSequence?: StepName[];
};

export type FormikateReturn<Values extends FormikValues> = ReturnType<
    typeof useFormik<Values>
> & {
    step: StepName | null;
    progress: {
        step: null | StepName;
        current: boolean;
    }[];
    isNext: boolean;
    isPrevious: boolean;
    handlePrevious(): void;
    handleNext(): void;
    handleGoto(step: StepName): void;
    isVisible(name: FieldName): boolean;
    isStep(name: StepName): boolean;
    isOptional(name: FieldName): boolean;
    isRequired(name: FieldName): boolean;
    [internalState]: {
        form: ReturnType<typeof useFormik<Values>>;
        step: null | StepName;
        fields: Fields;
        stepSequence: StepName[];
        setStep: React.Dispatch<React.SetStateAction<StepName | null>>;
        setFields: React.Dispatch<React.SetStateAction<Fields>>;
        currentStepIndex: null | number;
    };
};

export type Field<T = unknown> = {
    name: string;
    step?: null | StepName;
    validate: z.ZodType<T>;
};

export type VirtualField = Pick<Field, 'step'> & {
    virtual: true;
};

export type Fields = Field<unknown>[];

export type FieldProps<T = unknown> = (Field<T> | VirtualField) & {
    hidden?: boolean;
    default?: T;
    children: React.ReactNode;
};

export type FormProps<Values extends FormikValues> = {
    controller: FormikateReturn<Values>;
    children: ReactNode;
};
