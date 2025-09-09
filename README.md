## Features

- Dynamically render form fields using [`zod`](https://github.com/colinhacks/zod) or [`yup`](https://github.com/jquense/yup) schemas
- Supports multi-step forms using the `step` property
- Fields that get hidden are reset using the `initialValues` object
- Navigates to the earliest step that contains a validation error on submit

## Getting started

Define your steps and fields:

```tsx
import * as z from 'zod';
import { field, Fields } from 'schematik';

const schema = z.object({
    name: z.string().min(1).max(100),
    age: z.string().min(2).max(100),
    telephone: z.string().min(1).max(15),
});

enum Steps {
    Name,
    Address,
    Review,
}

type Values = z.infer<typeof schema>;

export function useFields(): Fields {
    return useCallback(
        (values: Values) => [
            field({
                name: 'name',
                step: Steps.Name,
                enabled: true,
                validate: schema.shape.name,
                element({ value, error, handleChange }) {
                    return <input name="name" value={value} onChange={handleChange} />;
                },
            }),
            field({
                name: 'age',
                step: Steps.Name,
                enabled: true,
                validate: schema.shape.age,
                element({ value, error, handleChange }) {
                    return <input name="age" value={value} onChange={handleChange} />;
                },
            }),
            field({
                name: 'telephone',
                step: Steps.Address,
                enabled: true,
                validate: schema.shape.telephone,
                element({ value, error, handleChange }) {
                    return <input name="telephone" value={value} onChange={handleChange} />;
                },
            }),
        ],
        [],
    );
}
```

Use the `Schematik` component and `useSchematik` hook in your application &ndash; the `<Schematik />` component is a wrapper around Formik's `<Formik />` component. It accepts all the same props as Formik, with the addition of a `schematikConfig` prop. Use the `<Fields />` component to render the applicable input fields.

```tsx
import { ReactElement, useCallback } from 'react';
import { Fields, Schematik, useSchematik } from 'schematik';

export default function App(): ReactElement {
    const fields = useFields();

    const schematik = useSchematik({
        fields,
        steps: [Steps.Name, Steps.Address, Steps.Review],
        initialStep: Steps.Name,
    });

    const handleSubmit = useCallback(
        (values) => {
            if (schematik.step === Steps.Review) return void console.log('Submitting form:', values);
            else schematik.handleNext();
        },
        [schematik],
    );

    return (
        <Schematik
            initialValues={{ name: '', age: '', telephone: '' }}
            schematikConfig={schematik}
            validateOnBlur={false}
            validateOnChange={false}
            onSubmit={handleSubmit}
        >
            {({ values, handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    {schematik.step !== Steps.Review ? (
                        <Fields />
                    ) : (
                        <div>
                            <h2>Review your information</h2>
                            <pre>{JSON.stringify(values, null, 2)}</pre>
                        </div>
                    )}

                    <button type="button" disabled={!schematik.hasPrevious} onClick={schematik.handlePrevious}>
                        Back
                    </button>

                    <button type="submit">{schematik.step === Steps.Review ? 'Submit' : 'Next'}</button>
                </form>
            )}
        </Schematik>
    );
}
```
