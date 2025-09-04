import { useFormik, type FormikSharedConfig } from "formik";
import { useLayoutEffect, useMemo, useState } from "react";
import * as z from "zod";
import type { Field, Fields, SchematikProps, Screen } from "./types";
import { toFormikValidationSchema } from "zod-formik-adapter";

function isRelevant(screen: Screen | undefined | null) {
  return (field: Field) => field.step === screen && field.enabled !== false;
}

export function useController<Values extends FormikSharedConfig>({
  schematikConfig,
  ...props
}: SchematikProps<Values>) {
  const screen = schematikConfig?.screen;
  const [validationSchema, setValidationSchema] = useState<Fields>(
    (schematikConfig?.getFields(props.initialValues) ?? []).filter(
      isRelevant(screen),
    ),
  );

  const form = useFormik({
    ...props,
    validationSchema: intoValidationSchema(validationSchema),
  });

  useLayoutEffect((): void => {
    const fields = schematikConfig?.getFields(form.values) ?? [];
    setValidationSchema(fields.filter(isRelevant(screen)));
  }, [form.values, schematikConfig, screen]);

  return useMemo(
    () => ({ state: { form, validationSchema, screen } }),
    [validationSchema, form, screen],
  );
}

function intoValidationSchema(fields: Fields) {
  const validationSchema = fields.reduce<Record<string, z.ZodTypeAny>>(
    (acc, field) => ({ ...acc, [field.name]: field.validate }),
    {},
  );

  return toFormikValidationSchema(z.object(validationSchema));
}
