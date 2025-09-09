## Features

- Dynamically render form fields using [`zod`](https://github.com/colinhacks/zod) or [`yup`](https://github.com/jquense/yup) schemas
- Supports multi-step forms using the `step` property
- Fields that get hidden are reset using the `initialValues` object
- Navigates to the earliest step that contains a validation error on submit

## Getting started

Define your steps and fields:

```tsx
import * as z from 'zod';
import { field, ValidationSchema } from 'formikate';

const validationSchema = z.object({
    name: z.string().min(1).max(100),
    age: z.string().min(2).max(100),
    telephone: z.string().min(1).max(15),
});

enum Steps {
    Name,
    Address,
    Review,
}

type ValidationSchema = z.infer<typeof validationSchema>;

export function useValidationSchema(): ValidationSchema {
    return useCallback(
        (values: Values) => [
            field({
                name: 'name',
                step: Steps.Name,
                enabled: true,
                validate: validationSchema.shape.name,
                element({ value, error, handleChange }) {
                    return <input name="name" value={value} onChange={handleChange} />;
                },
            }),
            field({
                name: 'age',
                step: Steps.Name,
                enabled: true,
                validate: validationSchema.shape.age,
                element({ value, error, handleChange }) {
                    return <input name="age" value={value} onChange={handleChange} />;
                },
            }),
            field({
                name: 'telephone',
                step: Steps.Address,
                enabled: true,
                validate: validationSchema.shape.telephone,
                element({ value, error, handleChange }) {
                    return <input name="telephone" value={value} onChange={handleChange} />;
                },
            }),
        ],
        [],
    );
}
```

Use the `Form` component and `useValidationSchema` hook in your application &ndash; the `Form` component is a wrapper around `Formik` &ndash; it accepts all the same props as Formik, with the addition of a `validationSchema` prop. Use the `Fields` component to render the applicable input fields.

```tsx
import { ReactElement, useCallback } from 'react';
import { Form, Fields, useValidationSchema } from 'formikate';

export default function App(): ReactElement {
    const formikate = useValidationSchema({
        validationSchema: getValidationSchema(),
        steps: [Steps.Name, Steps.Address, Steps.Review],
        initialStep: Steps.Name,
    });

    const handleSubmit = useCallback(
        (values) => {
            if (formikate.step === Steps.Review) return void console.log(values);
            else formikate.handleNext();
        },
        [formikate],
    );

    return (
        <Form
            initialValues={{ name: '', age: '', telephone: '' }}
            validationSchema={formikate}
            validateOnBlur={false}
            validateOnChange={false}
            onSubmit={handleSubmit}
        >
            {({ values, handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    {formikate.step !== Steps.Review ? (
                        <Fields />
                    ) : (
                        <div>
                            <h2>Review your information</h2>
                            <pre>{JSON.stringify(values, null, 2)}</pre>
                        </div>
                    )}

                    <button type="button" disabled={!formikate.hasPrevious} onClick={formikate.handlePrevious}>
                        Back
                    </button>

                    <button type="submit">{formikate.step === Steps.Review ? 'Submit' : 'Next'}</button>
                </form>
            )}
        </Form>
    );
}
```
