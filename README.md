![Formikate](media/logo.png)

🪚 Lightweight form builder for React that lets you dynamically render form fields from validation schemas, manage multi-step flows, and simplify validation handling.

## Features

- Dynamically render form fields using [`zod`](https://github.com/colinhacks/zod) or [`yup`](https://github.com/jquense/yup) schemas
- Supports multi-step forms using the `step` property
- Fields that get hidden are reset using the `initialValues` object
- Navigates to the earliest step that contains a validation error on submit

## Getting started

Define your validation schema, steps, and use the `useFormikate` hook to manage the form state. Then, use the `Form` and `Field` components to build your form.

```tsx
import * as z from 'zod';
import { Form, Field, useFormikate } from 'formikate';
import { ReactElement, useCallback } from 'react';

const enum Steps {
    Name,
    Address,
    Review,
}

const schema = z.object({
    name: z.string().min(1).max(100),
    age: z.string().min(2).max(100),
    telephone: z.string().min(1).max(15),
});

type Schema = z.infer<typeof schema>;

export default function Details(): ReactElement {
    const formikate = useFormikate({
        initialStep: Steps.Name,
        steps: [Steps.Name, Steps.Address, Steps.Review],
    });

    const handleSubmit = useCallback(
        (values: Schema) => {
            if (formikate.step === Steps.Review) {
                return void console.log('Submitting', values);
            }

            formikate.next();
        },
        [formikate],
    );

    return (
        <Form
            initialValues={{ name: '', age: '', telephone: '' }}
            validateOnBlur={false}
            validateOnChange={false}
            validationSchema={formikate}
            onSubmit={handleSubmit}
        >
            {(props) => (
                <form onSubmit={props.handleSubmit}>
                    <Field
                        name="name"
                        step={Steps.Name}
                        validate={schema.shape.name}
                    >
                        <label>Name</label>
                        <input type="text" {...props.getFieldProps('name')} />
                        <div>{props.errors.name}</div>
                    </Field>

                    <Field virtual step={Steps.Review}>
                        Review
                        <pre>{JSON.stringify(props.values, null, 2)}</pre>
                    </Field>

                    <Field
                        name="age"
                        step={Steps.Name}
                        validate={schema.shape.age}
                    >
                        <label>Age</label>
                        <input type="text" {...props.getFieldProps('age')} />
                        <div>{props.errors.age}</div>
                    </Field>

                    {props.values.name !== 'Adam' && (
                        <Field
                            name="telephone"
                            step={Steps.Address}
                            validate={schema.shape.telephone}
                        >
                            <label>Telephone</label>
                            <input
                                type="text"
                                {...props.getFieldProps('telephone')}
                            />
                            <div>{props.errors.telephone}</div>
                        </Field>
                    )}

                    <button
                        type="button"
                        disabled={!formikate.isPrevious}
                        onClick={formikate.previous}
                    >
                        Back
                    </button>

                    <button type="submit">
                        {formikate.step === Steps.Review ? 'Submit' : 'Next'}
                    </button>

                    <div>
                        <strong>
                            {formikate.progress.current} of{' '}
                            {formikate.progress.total}
                        </strong>
                    </div>
                </form>
            )}
        </Form>
    );
}
```

> **Note:** The `steps` array in `useFormikate` defines the order of the steps. It does not determine which steps are visible. The visibility of steps is determined by the `<Field>` components and their `step` prop. If you change the order of `steps` during render, the form will reset to either the initial step, if defined, otherwise the first step in the new order.
