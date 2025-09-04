import { Fragment, type ReactElement } from "react";
import { FormikContext, getIn, type FormikSharedConfig } from "formik";
import type { SchematicProps } from "./types";
import { useController } from "./utils";

export default function Schematik<Values extends FormikSharedConfig>(
  props: SchematicProps<Values>,
): ReactElement {
  const controller = useController(props);

  return (
      <FormikContext.Provider value={controller.state.form}>
        {typeof props.children === "function"
          ? props.children(controller.state.form)
          : props.children}

        {Object.values(controller.state.fields).map((field) => (
          <Fragment key={field.path}>
            {field.meta.render<Values>({
              ...controller.state.form,
              value: getIn(controller.state.form.values, field.path),
            })}
          </Fragment>
        ))}
      </FormikContext.Provider>
  );
}
