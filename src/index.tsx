import { Fragment, useMemo, useState, type ReactElement } from "react";
import { FormikContext, getIn, type FormikSharedConfig } from "formik";
import type {
  Fields,
  SchematikProps,
  Screen,
  UseSchematikConfig,
  UseSchematikProps,
  ValidationSchemaField,
} from "./types";
import { useController } from "./utils";

export type { Fields } from "./types";

// eslint-disable-next-line react-refresh/only-export-components
export function field<T>(field: ValidationSchemaField<T>): Fields[number] {
  return field as Fields[number];
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSchematik({
  fields,
  initialScreen,
  screens,
}: UseSchematikProps): UseSchematikConfig {
  const [screen, setScreen] = useState<null | Screen>(initialScreen ?? null);

  return useMemo(() => {
    const safeScreens = screens ?? [];
    const currentIndex = screen !== null ? safeScreens.indexOf(screen) : -1;

    const hasPrevious = currentIndex > 0;
    const hasNext =
      currentIndex !== -1 && currentIndex < safeScreens.length - 1;

    const handlePrevious = () => {
      if (hasPrevious) {
        setScreen(safeScreens[currentIndex - 1]);
      }
    };

    const handleNext = () => {
      if (hasNext) {
        setScreen(safeScreens[currentIndex + 1]);
      }
    };

    return {
      screen,
      screens: safeScreens,
      getFields: fields,
      hasPrevious: () => hasPrevious,
      hasNext: () => hasNext,
      handlePrevious,
      handleNext,
    };
  }, [fields, screen, screens]);
}

export function Schematik<Values extends FormikSharedConfig>(
  props: SchematikProps<Values>,
): ReactElement {
  const controller = useController(props);

  return (
    <FormikContext.Provider value={controller.state.form}>
      {controller.state.validationSchema.map((field) => (
        <Fragment key={field.name}>
          {field.element({
            ...controller.state.form,
            value: getIn(controller.state.form.values, field.name),
            error: getIn(controller.state.form.errors, field.name),
          })}
        </Fragment>
      ))}

      {typeof props.children === "function"
        ? props.children(controller.state.form)
        : props.children}
    </FormikContext.Provider>
  );
}
