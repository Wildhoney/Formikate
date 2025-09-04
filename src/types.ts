import type {
  FormikConfig,
  FormikSharedConfig,
  FormikValues,
  useFormik,
} from "formik";
import type { ReactNode } from "react";
import type { ZodObject } from "zod";

type FormikProps<Values extends FormikSharedConfig> = Omit<
  FormikConfig<Values>,
  "validationSchema"
>;

export type SchematicProps<Values extends FormikSharedConfig> =
  FormikProps<Values> & {
    validationSchema(values: Values): ZodObject;
  };

type FieldProps<Values extends FormikValues> = ReturnType<
  typeof useFormik<Values>
> & {
  value: unknown;
};

export type Field = {
  path: string;
  meta: {
    render<Values extends FormikValues>(props: FieldProps<Values>): ReactNode;
  };
  optional: boolean;
};
