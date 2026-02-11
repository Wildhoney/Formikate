# <img src="media/icon.png" alt="Formikate" width="32" height="32" /> Formikate

[![Checks](https://github.com/Wildhoney/Formikate/actions/workflows/checks.yml/badge.svg)](https://github.com/Wildhoney/Formikate/actions/workflows/checks.yml)

Lightweight form builder for React that lets you dynamically render form fields from validation schemas, manage multi-step flows, and simplify validation handling.

**[View Live Demo](https://wildhoney.github.io/Formikate/)**

## Features

- Dynamically render form fields using [`zod`](https://github.com/colinhacks/zod) validation schemas
- Declarative multi-step forms via `useFields` configuration
- Inactive fields are automatically reset to their default values
- Steps without active fields are automatically skipped during navigation
- Per-step validation &mdash; only fields on the current step (or earlier) are validated on submit

## Getting started

Begin by defining your validation schema and field descriptors:

```tsx
import * as z from 'zod';

export const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    address: z.string().min(1, 'Address is required'),
    guest: z.boolean(),
});

export type Schema = z.infer<typeof schema>;

export const fields = {
    name: { step: 'personal' as const, validate: schema.shape.name, value: '' },
    address: {
        step: 'delivery' as const,
        validate: schema.shape.address,
        value: '',
    },
    guest: {
        step: 'personal' as const,
        validate: schema.shape.guest,
        value: false,
    },
};
```

Import `useForm` &ndash; it accepts all of the same [`useFormik` (`Formik`) arguments](https://formik.org/docs/api/useFormik) (except `validate`, `validationSchema`, and `initialValues` which are handled internally). Initial values are derived from each field's `value` property:

```tsx
import { useForm, useFields, Position } from 'formikate';
import { fields } from './utils';

const form = useForm<Schema>({
    fields,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit(values) {
        if (!form.status.progress.last)
            return void form.status.navigate.to(Position.Next);
        console.log('Submitting', values);
    },
});
```

You can use `form` to access [all of the usual](https://formik.org/docs/api/formik#props-1) Formik properties such as `form.values` and `form.errors`.

## Defining Steps and Fields

Use `useFields` to declare the step structure and field configuration. The `step` property on each field is strongly typed &mdash; it must match one of the identifiers in the `steps` array:

```tsx
useFields(form, () => ({
    steps: ['personal', 'delivery', 'review'],
    fields: {
        ...fields,
        address: {
            ...fields.address,
            active: form.values.guest === false,
        },
    },
}));
```

### Config Shape

| Property | Type                             | Description                               |
| -------- | -------------------------------- | ----------------------------------------- |
| `steps`  | `(string \| number \| symbol)[]` | Ordered list of step identifiers          |
| `fields` | `Record<string, FieldConfig>`    | Map of field names to their configuration |

### Field Config

| Property   | Type                         | Description                                                                                                     |
| ---------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `step`     | `string \| number \| symbol` | Which step this field belongs to &mdash; must match one of the identifiers in `steps`                           |
| `validate` | `ZodType`                    | Zod schema used for validation                                                                                  |
| `value`    | `unknown`                    | Default/reset value for the field &mdash; also used as the initial value when passed to `useForm`               |
| `active`   | `boolean?`                   | Whether the field is active (default `true`). Inactive fields are excluded from validation and reset to `value` |

### Automatic Step Skipping

Steps where all fields have `active: false` are automatically skipped during navigation:

```tsx
useFields(form, () => ({
    steps: ['personal', 'delivery', 'review'],
    fields: {
        ...fields,
        address: {
            ...fields.address,
            active: form.values.guest === false,
        },
    },
}));
```

When `guest` is `true`, the `address` field is inactive, so the delivery step is skipped.

## Status

After calling `useFields`, the computed state is available on `form.status`:

```tsx
form.status.empty; // boolean — true when no fields/steps are configured
form.status.field; // Record<string, { exists(), required, optional }>
form.status.progress; // step progression state
form.status.navigate; // navigation controls
```

### Field State

```tsx
form.status.field.name.exists(); // true if the field is active
form.status.field.name.required; // true if the Zod schema rejects `undefined`
form.status.field.name.optional; // inverse of required
```

### Progress

```tsx
form.status.progress.current; // identifier of the current step
form.status.progress.position; // zero-based index within visible steps
form.status.progress.total; // total number of visible steps
form.status.progress.first; // whether on the first visible step
form.status.progress.last; // whether on the last visible step
form.status.progress.steps; // array of { id, index } for visible steps
form.status.progress.step; // map of step id → { visible, current }
```

### Navigation

```tsx
import { Position } from 'formikate';

form.status.navigate.to(Position.Next); // go to next step
form.status.navigate.to(Position.Previous); // go to previous step
form.status.navigate.to(Position.First); // go to first step
form.status.navigate.to(Position.Last); // go to last step
form.status.navigate.to('review'); // go to a specific step by id

form.status.navigate.exists(Position.Next); // true if a next step exists
form.status.navigate.exists(Position.Previous); // true if a previous step exists
form.status.navigate.exists('review'); // true if a specific step is reachable
```

## Rendering

Use Formikate's `Form` component to provide the form to child components:

```tsx
import { Form, Position } from 'formikate';

<Form value={form}>
    <form onSubmit={form.handleSubmit}>
        {form.status.field.name.exists() && (
            <input type="text" {...form.getFieldProps('name')} />
        )}

        {form.status.field.address.exists() && (
            <input type="text" {...form.getFieldProps('address')} />
        )}

        <button
            type="button"
            disabled={!form.status.navigate.exists(Position.Previous)}
            onClick={() => form.status.navigate.to(Position.Previous)}
        >
            Back
        </button>

        <button type="submit">
            {form.status.progress.last ? 'Submit' : 'Next'}
        </button>
    </form>
</Form>;
```

### Accessing Form in Child Components

Use the `useFormContext` hook in child components to access the form with properly typed `status`:

```tsx
import { useFormContext } from 'formikate';
import type { Schema } from './types';

function NameField() {
    const form = useFormContext<Schema>();

    if (!form.status.field.name.exists()) return null;

    return <input type="text" {...form.getFieldProps('name')} />;
}
```

## Empty State

When all fields are inactive, `form.status.empty` is `true`:

```tsx
{
    form.status.empty ? (
        <p>No fields available</p>
    ) : (
        <form onSubmit={form.handleSubmit}>{/* ... */}</form>
    );
}
```
