# <img src="media/icon.png" alt="Formikate" width="32" height="32" /> Formikate

[![Checks](https://github.com/Wildhoney/Formikate/actions/workflows/checks.yml/badge.svg)](https://github.com/Wildhoney/Formikate/actions/workflows/checks.yml)

Lightweight form builder for React that lets you dynamically render form fields from validation schemas, manage multi-step flows, and simplify validation handling.

**[View Live Demo](https://wildhoney.github.io/Formikate/)**

## Features

- Dynamically render form fields using [`zod`](https://github.com/colinhacks/zod) validation schemas
- Declarative multi-step forms via `useFields` configuration
- Fields can be set to `Mode.Detached` to be excluded from the form and reset to their default values
- Attached fields with `hidden: true` are validated on submit but never rendered — surfaced through `onInvalid` (which fires on any submit-blocked validation and passes `meta.hidden` to identify this case)
- Steps whose attached fields are all hidden (or whose only fields are detached) are automatically skipped during navigation
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
    name: {
        step: 'personal' as const,
        validate: schema.shape.name,
        value: '',
    },
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
import { useForm, useFields, Cursor } from 'formikate';
import { fields } from './utils';

const form = useForm<Schema>({
    fields,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit(values) {
        if (!form.status.progress.last())
            return void form.status.navigate.to(Cursor.Next);
        console.log('Submitting', values);
    },
});
```

You can use `form` to access [all of the usual](https://formik.org/docs/api/formik#props-1) Formik properties such as `form.values` and `form.errors`.

## Defining Steps and Fields

Use `useFields` to declare the step structure and field configuration. The `step` property on each field is strongly typed &mdash; it must match one of the identifiers in the `steps` array:

```tsx
import { Mode } from 'formikate';

useFields(form, () => ({
    steps: ['personal', 'delivery', 'review'],
    fields: {
        ...fields,
        address: {
            ...fields.address,
            mode: form.values.guest ? Mode.Detached : Mode.Attached,
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

| Property   | Type                         | Description                                                                                                                                                                                                                                                                               |
| ---------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `step`     | `string \| number \| symbol` | Which step this field belongs to &mdash; must match one of the identifiers in `steps`                                                                                                                                                                                                     |
| `validate` | `ZodType`                    | Zod schema used for validation                                                                                                                                                                                                                                                            |
| `value`    | `unknown`                    | Default/reset value &mdash; also used as the initial value when passed to `useForm`                                                                                                                                                                                                       |
| `mode`     | `Mode?`                      | `Mode.Attached` (default) — the field participates in the form; `Mode.Detached` — the field is excluded from validation and reset to `value`                                                                                                                                              |
| `hidden`   | `boolean?`                   | When `true` on an `Attached` field, the field is not rendered but its value is still submitted and validated on every submit attempt. Ignored when `Detached`. `onInvalid` fires on any submit-blocked validation and sets `meta.hidden = true` when at least one invalid field is hidden |

### Step Mode

A step's mode and visibility are derived from its fields:

- Any `Attached` field (or zero fields) &rarr; step is `Attached`. It appears in the navigation flow when at least one field is non-hidden.
- Every attached field on the step is `hidden: true` &rarr; the step is `Attached` but `.hidden()`. It is skipped in navigation; its fields still validate on submit.
- All fields are `Detached` &rarr; step is `Detached`. It is fully absent.

### Automatic Step Skipping

Steps whose attached fields are all hidden, or whose only fields are detached, are skipped during navigation:

```tsx
import { Mode } from 'formikate';

useFields(form, () => ({
    steps: ['personal', 'delivery', 'review'],
    fields: {
        ...fields,
        address: {
            ...fields.address,
            mode: form.values.guest ? Mode.Detached : Mode.Attached,
        },
    },
}));
```

When `guest` is `true`, the `address` field becomes `Mode.Detached`, so the delivery step (whose only field is now absent) is skipped.

## Status

After calling `useFields`, the computed state is available on `form.status`. All accessors are functions for consistency:

```tsx
form.status.empty; // boolean — true when no fields/steps are configured
form.status.field; // Record<string, Result>
form.status.step; // Record<Step, StepResult>
form.status.progress; // step progression
form.status.navigate; // navigation controls
```

### Field State

```tsx
form.status.field.name.mode(Mode.Attached); // true when the field is in the form
form.status.field.name.mode(Mode.Detached); // true when the field is excluded
form.status.field.name.hidden(); // true when attached but flagged hidden
form.status.field.name.visible(); // true when attached and not hidden (i.e. should render)
form.status.field.name.required(); // true if the Zod schema rejects `undefined`
form.status.field.name.optional(); // inverse of required()
```

### Step State

```tsx
form.status.step.personal.mode(Mode.Attached); // true when this step is in the navigation flow
form.status.step.personal.mode(Mode.Detached); // true when the step is fully absent
form.status.step.personal.hidden(); // true when every attached field is hidden
form.status.step.personal.visible(); // true when the step has at least one non-hidden field
form.status.step.personal.active(); // true when this is the current step
form.status.step.personal.fields(); // array of visible attached field names on this step
```

### Progress

```tsx
form.status.progress.current(); // identifier of the current step
form.status.progress.position(); // zero-based index within visible steps
form.status.progress.total(); // total number of visible steps
form.status.progress.first(); // whether on the first visible step
form.status.progress.last(); // whether on the last visible step
form.status.progress.steps(); // array of { id, index } for visible steps
```

### Navigation

```tsx
import { Cursor } from 'formikate';

form.status.navigate.to(Cursor.Next); // go to next step
form.status.navigate.to(Cursor.Previous); // go to previous step
form.status.navigate.to(Cursor.First); // jump to first step
form.status.navigate.to(Cursor.Last); // jump to last step
form.status.navigate.to('review'); // go to a specific step by id

form.status.navigate.possible(Cursor.Next); // true if a next step exists
form.status.navigate.possible(Cursor.Previous); // true if a previous step exists
form.status.navigate.possible(Cursor.First); // true if a first step exists
form.status.navigate.possible(Cursor.Last); // true if a last step exists
form.status.navigate.possible('review'); // true if a specific step is reachable
```

## Rendering

Use Formikate's `Form` component to provide the form to child components:

```tsx
import { Form, Cursor } from 'formikate';

<Form value={form}>
    <form onSubmit={form.handleSubmit}>
        {form.status.field.name.visible() && (
            <input type="text" {...form.getFieldProps('name')} />
        )}

        {form.status.field.address.visible() && (
            <input type="text" {...form.getFieldProps('address')} />
        )}

        <button
            type="button"
            disabled={!form.status.navigate.possible(Cursor.Previous)}
            onClick={() => form.status.navigate.to(Cursor.Previous)}
        >
            Back
        </button>

        <button type="submit">
            {form.status.progress.last() ? 'Submit' : 'Next'}
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

    if (!form.status.field.name.visible()) return null;

    return <input type="text" {...form.getFieldProps('name')} />;
}
```

## Multi-Step Rendering

Gate whole sections of your form by step using `form.status.step[id].active()`. Each step renders only when it's the current step:

```tsx
import { Form, Cursor } from 'formikate';

<Form value={form}>
    <form onSubmit={form.handleSubmit}>
        {form.status.step.personal.active() && (
            <>
                <input type="text" {...form.getFieldProps('name')} />
                <input type="checkbox" {...form.getFieldProps('guest')} />
            </>
        )}

        {form.status.step.delivery.active() && (
            <input type="text" {...form.getFieldProps('address')} />
        )}

        {form.status.step.review.active() && <Review />}

        <button
            type="button"
            disabled={!form.status.navigate.possible(Cursor.Previous)}
            onClick={() => form.status.navigate.to(Cursor.Previous)}
        >
            Back
        </button>

        <button type="submit">
            {form.status.progress.last() ? 'Submit' : 'Next'}
        </button>
    </form>
</Form>;
```

Advance steps from inside `onSubmit` &mdash; per-step validation runs first, so the call only fires once the current step is valid:

```tsx
const form = useForm<Schema>({
    fields,
    onSubmit(values) {
        if (!form.status.progress.last())
            return void form.status.navigate.to(Cursor.Next);
        console.log('Submitting', values);
    },
});
```

For milestone steps that have no inputs (e.g. a "done" screen), check `step[id].fields().length === 0` to swap the Next button for a different action:

```tsx
{
    form.status.step.done.active() &&
        form.status.step.done.fields().length === 0 && <Done />;
}
```

## Empty State

When no fields or steps are configured, `form.status.empty` is `true`:

```tsx
{
    form.status.empty ? (
        <p>No fields available</p>
    ) : (
        <form onSubmit={form.handleSubmit}>{/* ... */}</form>
    );
}
```
