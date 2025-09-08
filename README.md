## Features

- Dynamically render form fields using [`zod`](https://github.com/colinhacks/zod) or [`yup`](https://github.com/jquense/yup) schemas
- Supports multi-step forms using the `step` property
- Fields that get hidden are reset using the `initialValues` object
- Navigates to the earliest step that contains a validation error on submit

## Getting started

Define your steps and fields:

```tsx
import * as z from 'zod';
import { Steps } from './types';
import { field, Fields } from 'schematik';

const schema = z.object({
    name: z.string().min(1).max(100),
    age: z.string().min(2).max(100),
    telephone: z.string().min(1).max(15),
});

export function fields(values: z.infer<typeof schema>): Fields {
    return [
        field({
            name: 'name',
            step: Steps.Name,
            validate: schema.shape.name,
            element({ value, error, handleChange }) {
                return (
                    <div>
                        <label htmlFor="name">Name</label>
                        <input
                            name="name"
                            value={value}
                            onChange={handleChange}
                        />
                        {error && <div>{error}</div>}
                    </div>
                );
            },
        }),
        field({
            name: 'age',
            step: Steps.Name,
            validate: schema.shape.age,
            element({ value, error, handleChange }) {
                return (
                    <div>
                        <label htmlFor="age">Age</label>
                        <input
                            name="age"
                            value={value}
                            onChange={handleChange}
                        />
                        {error && <div>{error}</div>}
                    </div>
                );
            },
        }),
        field({
            name: 'telephone',
            step: Steps.Address,
            validate: schema.shape.telephone,
            element({ value, error, handleChange }) {
                return (
                    <div>
                        <label htmlFor="telephone">Telephone</label>
                        <input
                            name="telephone"
                            value={value}
                            onChange={handleChange}
                        />
                        {error && <div>{error}</div>}
                    </div>
                );
            },
        }),
    ];
}
```

Use the `Schematik` component and `useSchematik` hook in your application:

```tsx
import { ReactElement, useCallback } from 'react';
import { Schematik, useSchematik } from 'schematik';
import { fields } from './utils';
import { Steps } from './types';

export default function App(): ReactElement {
    const schematik = useSchematik({
        fields,
        steps: [Steps.Name, Steps.Address, Steps.Review],
        initialStep: Steps.Name,
    });

    const handleSubmit = useCallback(
        (values) => {
            if (schematik.step === Steps.Review)
                return void console.log('Submitting form:', values);
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
            {(props) => (
                <form onSubmit={props.handleSubmit}>
                    {schematik.step === Steps.Review && (
                        <div>
                            <h2>Review your information</h2>
                            <pre>{JSON.stringify(props.values, null, 2)}</pre>
                        </div>
                    )}

                    <button
                        type="button"
                        disabled={!schematik.hasPrevious}
                        onClick={schematik.handlePrevious}
                    >
                        Back
                    </button>

                    <button type="submit">
                        {schematik.step === Steps.Review ? 'Submit' : 'Next'}
                    </button>
                </form>
            )}
        </Schematik>
    );
}
```
