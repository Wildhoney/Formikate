import type { FormikConfig, FormikValues, useFormik } from 'formik';
import type { ReactNode } from 'react';
import type { ZodType } from 'zod';

type FormikProps<Values extends FormikValues> = Omit<FormikConfig<Values>, 'validationSchema'>;

export type Step = string | number | symbol;

export type UseSchematikProps = {
    fields(values: unknown): Fields;
    steps?: Step[];
    initialStep?: Step;
};

export type UseSchematikConfig = {
    step: null | Step;
    steps: Step[];
    getFields(values: unknown): Fields;
    hasPrevious: boolean;
    hasNext: boolean;
    handlePrevious(): void;
    handleNext(): void;
    handleSet(step: Step): void;
};

export type SchematikProps<Values extends FormikValues> = FormikProps<Values> & {
    schematikConfig?: UseSchematikConfig;
};

export type FieldProps<Values extends FormikValues> = ReturnType<typeof useFormik<Values>> & {
    value: unknown;
    error: undefined | string;
    optional: boolean;
};

export type ValidationSchemaField<T> = {
    name: string;
    step?: Step;
    enabled?: boolean;
    validate: ZodType<T>;
    optional?: boolean;
    element<Values extends FormikValues>(props: Omit<FieldProps<Values>, 'value'> & { value: T }): ReactNode;
};

export type Field = {
    name: string;
    step?: Step;
    enabled?: boolean;
    validate: ZodType<unknown>;
    optional?: boolean;
    element<Values extends FormikValues>(props: FieldProps<Values>): ReactNode;
};

export type Fields = Field[];
