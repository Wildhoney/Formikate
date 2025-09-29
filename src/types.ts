import type { FormikConfig, FormikValues } from 'formik';
import * as z from 'zod';
import type { internalState } from './utils';

export type Step = string | number | symbol;

export type FormikateProps = {
    initialStep: null | Step;
    steps: Step[];
};

export type FormikateReturn = {
    next(): void;
    previous(): void;
    goto(step: Step): void;
    [internalState]: {
        validationSchema: z.ZodType | undefined;
        setFields: React.Dispatch<React.SetStateAction<Fields>>;
    };
};

export type Field = {
    name: string;
    step: Step;
    validate: z.ZodType;
};

export type Fields = Field[];

export type FieldProps = Field & {
    children: React.ReactNode;
};

// import type {
//     FieldHelperProps,
//     FieldInputProps,
//     FieldMetaProps,
//     FormikConfig,
//     FormikProps,
//     FormikValues,
// } from 'formik';
// import type { ReactNode } from 'react';
// import * as z from 'zod';
// import type { symbols } from './utils';

// type Steps = (string | number | symbol)[];

// export type Step = Steps[number];

export type FormProps<Values extends FormikValues> = Omit<FormikConfig<Values>, 'validationSchema' | 'validate'> &
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

// export type FilteredFields<S extends Schema> = {
//     steps: Steps;
//     initialStep: Step;
//     formFields: Fields<S>;
// };

// export type GetFilteredFields<S extends Schema> = (values: S) => FilteredFields<S>;

// export type Fields<S extends Schema> = (
//     | {
//           [K in keyof S]: {
//               name: K;
//               visible?: boolean;
//               step: Step;
//               validate?: z.ZodType<S[K]>;
//               element(props: FieldInputProps<S> & FieldHelperProps<S> & FieldMetaProps<S>): ReactNode;
//           };
//       }[keyof S]
//     | {
//           name?: undefined;
//           visible?: boolean;
//           step: Step;
//           element(props: FormikProps<S>): ReactNode;
//       }
// )[];

// export type Field<S extends Schema> = Fields<S>[number];

// export type State<S extends Schema> = {
//     step: null | Step;
//     steps: Steps;
//     isPrevious: boolean;
//     previous(): void;
//     isNext: boolean;
//     next(): void;
//     goto(step: null | Step): void;
//     setSteps: (steps: Steps) => void;
//     getFilteredFields: <S extends Schema>(values: S) => FilteredFields<S>;
//     setValidationSchema: (validationSchema: z.ZodObject<S>) => void;
// };
