import type { FormikConfig, FormikValues } from 'formik';
import * as z from 'zod';
import type { internalState } from './utils';

export type Step = string | number | symbol;

export type FormikateProps = {
    initialStep: null | Step;
    steps: Step[];
};

export type ResetProps = Pick<FormikateProps, 'steps' | 'initialStep'> & {
    setStep: React.Dispatch<React.SetStateAction<Step | null>>;
};

export type StepsProps = {
    step: Step | null;
    steps: Step[];
    fields: Fields;
};

export type LifecycleProps = Field;

export type MutateProps = Field;

export type FormikateReturn = {
    next(): void;
    previous(): void;
    step: Step | null;
    isNext: boolean;
    isPrevious: boolean;
    progress: {
        step: Step;
        current: boolean;
    }[];
    goto(step: Step): void;
    [internalState]: {
        step: null | Step;
        fields: Fields;
        steps: Step[];
        setStep: React.Dispatch<React.SetStateAction<Step | null>>;
        setFields: React.Dispatch<React.SetStateAction<Fields>>;
        currentStepIndex: number;
        validationSchema: { validate: (values: FormikValues) => Promise<void> };
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
    children: React.ReactNode;
};

export type FormProps<Values extends FormikValues> = Omit<
    FormikConfig<Values>,
    'validationSchema' | 'validate'
> &
    (
        | {
              validate: FormikateReturn;
              validationSchema?: never;
          }
        | {
              validate?: never;
              validationSchema: FormikateReturn;
          }
    );
