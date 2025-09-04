import { useFormik, type FormikSharedConfig } from "formik";
import { useLayoutEffect, useMemo, useState } from "react";
import { ZodObject, type ZodTypeAny } from "zod";
import type { Field, SchematicProps } from "./types";
import { toFormikValidationSchema } from "zod-formik-adapter";

export function useController<Values extends FormikSharedConfig>({
  validationSchema: getValidationSchema,
  ...props
}: SchematicProps<Values>) {
  const [validationSchema, setValidationSchema] = useState<ZodObject>(
    getValidationSchema(props.initialValues),
  );

  const form = useFormik({
    ...props,
    validationSchema: toFormikValidationSchema(validationSchema),
  });

  const fields = useMemo(
    () => parseValidationSchema(validationSchema),
    [validationSchema],
  );

  useLayoutEffect(
    (): void => setValidationSchema(getValidationSchema(form.values)),
    [form.values, getValidationSchema],
  );

  return useMemo(() => ({ state: { form, fields } }), [fields, form]);
}

export function parseValidationSchema(
  schema: ZodTypeAny,
  prefix: string[] = [],
): Field[] {
  if (schema instanceof ZodObject) {
    const shape = schema.shape;
    return Object.entries(shape).flatMap(([key, value]) =>
      parseValidationSchema(value, [...prefix, key]),
    );
  }

  //   if (schema instanceof ZodArray) {
  //     return getPaths(schema.element as ZodArray, [...prefix, "[*]"]);
  //   }

  return [
    {
      path: prefix.join("."),
      meta: schema.meta() as Field["meta"],
      optional: schema.isOptional(),
    },
  ];
}
