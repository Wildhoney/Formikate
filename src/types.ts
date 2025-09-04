import type {
  FormikConfig,
  FormikSharedConfig,
  FormikValues,
  useFormik,
} from "formik";
import type { ReactNode } from "react";
import type { ZodType } from "zod";

type FormikProps<Values extends FormikSharedConfig> = Omit<
  FormikConfig<Values>,
  "validationSchema"
>;

export type Screen = string | number | symbol;

export type UseSchematikProps = {
  fields(values: unknown): Fields;
  screens?: Screen[];
  initialScreen?: Screen;
};

export type UseSchematikConfig = {
  screen: null | Screen;
  screens: Screen[];
  getFields(values: unknown): Fields;
  hasPrevious(): boolean;
  hasNext(): boolean;
  handlePrevious(): void;
  handleNext(): void;
};

export type SchematikProps<Values extends FormikSharedConfig> =
  FormikProps<Values> & {
    schematikConfig?: UseSchematikConfig;
  };

type FieldProps<Values extends FormikValues> = ReturnType<
  typeof useFormik<Values>
> & {
  value: unknown;
  error: unknown;
};

export type ValidationSchemaField<T> = {
  name: string;
  step?: Screen;
  enabled?: boolean;
  validate: ZodType<T>;
  optional?: boolean;
  element<Values extends FormikValues>(
    props: Omit<FieldProps<Values>, "value"> & { value: T },
  ): ReactNode;
};

export type Field = {
  name: string;
  step?: Screen;
  enabled?: boolean;
  validate: ZodType<unknown>;
  optional?: boolean;
  element<Values extends FormikValues>(props: FieldProps<Values>): ReactNode;
};

export type Fields = Field[];
