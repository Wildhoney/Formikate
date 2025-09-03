## Features

- Dynamically render form fields using Zod or Yup schemas
- Supports multi-step forms using the `screen` meta data
- Fields that get hidden are reset using the `initialValues`
- Navigate to the earliest screen that contains a validation error
- Handles nested form fields using the dot notation

## Getting started

```tsx
import * as z from "zod";
import { Formik } from "schematik";

// ...

enum Screen {
  Details,
  OTP,
}

export function validationSchema(values) {
  return z.object({
    name: z.string().meta({
      screen: Screen.Details,
      render({ handleChange, ...props }) {
        return <Input.Text {...props} onChange={handleChange} />;
      },
    }),
    age: z
      .number()
      .optional()
      .meta({
        screen: Screen.Details,
        render({ handleChange, ...props }) {
          return <Input.Number {...props} onChange={handleChange} />;
        },
      }),
    telephone: z.number().meta({
      screen: Screen.OTP,
      render({ handleChange, ...props }) {
        return <Input.TelephoneNumber {...props} onChange={handleChange} />;
      },
    }),
  });
}

// ...

export default function Form(): ReactElement {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {(props) => (
        <form onSubmit={props.handleSubmit}>
          {props.fields}

          <button type="button" onClick={props.handleBack}>
            Back
          </button>

          <button type="submit">
            {props.screen === Screen.OTP ? "Submit" : "Next"}
          </button>
        </form>
      )}
    </Formik>
  );
}
```
