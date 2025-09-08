## Features

- Dynamically render form fields using [`zod`](https://github.com/colinhacks/zod) or [`yup`](https://github.com/jquense/yup) schemas
- Supports multi-step forms using the `step` property
- Fields that get hidden are reset using the `initialValues` object
- Navigates to the earliest step that contains a validation error on submit

## Getting started

Define your steps and fields:

```tsx
export const enum Screens {
    Name,
    Address,
    Review,
}

import * as z from 'zod';
import { field, Fields } from 'schematik';
import { Screens } from './types';

export function fields(): Fields {
    return [
        field({
            name: 'name',
            step: Screens.Name,
            validate: z.string(),
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
            step: Screens.Name,
            validate: z.string().min(2).max(100),
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
            step: Screens.Address,
            validate: z.string().min(10).max(15),
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
import { ReactElement } from 'react';
import { Schematik, useSchematik } from 'schematik';
import { fields } from './utils';
import { Screens } from './types';

export default function App(): ReactElement {
    const schematik = useSchematik({
        fields,
        screens: [Screens.Name, Screens.Address, Screens.Review],
        initialScreen: Screens.Name,
    });

    return (
        <Schematik
            initialValues={{ name: '', age: '', telephone: '' }}
            schematikConfig={schematik}
            validateOnBlur={false}
            validateOnChange={false}
            onSubmit={console.log}
        >
            {(props) => (
                <form onSubmit={props.handleSubmit}>
                    <button
                        type="button"
                        disabled={!schematik.hasPrevious}
                        onClick={schematik.handlePrevious}
                    >
                        Back
                    </button>

                    <button
                        type="button"
                        disabled={!schematik.hasNext}
                        onClick={schematik.handleNext}
                    >
                        Next
                    </button>
                    <button type="submit">Submit</button>
                </form>
            )}
        </Schematik>
    );
}
```
