import type { FormikConfig, FormikValues, useFormik } from 'formik';
import * as z from 'zod';
import type { internalState } from './context/index.js';
import type { ReactNode } from 'react';

export type Step = string | number;

export type FormikateProps<Values extends FormikValues> =
    FormikConfig<Values> & {
        initialStep: null | Step;
        stepSequence?: Step[];
    };

export type FormikateReturn<Values extends FormikValues> = ReturnType<
    typeof useFormik<Values>
> & {
    step: Step | null;
    progress: {
        step: Step;
        current: boolean;
    }[];
    isNext: boolean;
    isPrevious: boolean;
    handlePrevious(): void;
    handleNext(): void;
    handleGoto(step: Step): void;
    [internalState]: {
        form: ReturnType<typeof useFormik<Values>>;
        step: null | Step;
        fields: Fields;
        stepSequence: Step[];
        setStep: React.Dispatch<React.SetStateAction<Step | null>>;
        setFields: React.Dispatch<React.SetStateAction<Fields>>;
        currentStepIndex: null | number;
    };
};

export type Field = {
    name: string;
    step: Step;
    validate: z.ZodType;
};

export type VirtualField = {
    virtual: true;
    step: Step;
};

export type Fields = Field[];

export type FieldProps = (Field | VirtualField) & {
    hidden?: boolean;
    children: React.ReactNode;
};

export type FormProps<Values extends FormikValues> = React.DetailedHTMLProps<
    React.FormHTMLAttributes<HTMLFormElement>,
    HTMLFormElement
> & {
    config: FormikateReturn<Values>;
    children: ReactNode;
};
