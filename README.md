# <img src="media/icon.png" alt="Formikate" width="32" height="32" /> Formikate

[![Checks](https://github.com/Wildhoney/Formikate/actions/workflows/checks.yml/badge.svg)](https://github.com/Wildhoney/Formikate/actions/workflows/checks.yml)

Lightweight form builder for React that lets you dynamically render form fields from validation schemas, manage multi-step flows, and simplify validation handling.

**[View Live Demo](https://wildhoney.github.io/Formikate/)**

## Features

- Dynamically render form fields using [`zod`](https://github.com/colinhacks/zod)
- Declarative multi-step forms using the `<Step>` component
- Fields that get hidden are reset using the `initialValues` object
- Steps without fields are automatically skipped during navigation
- Navigates to the earliest step that contains a validation error on submit

## Getting started

Begin by defining your validation schema and step order:

```tsx
export const enum Steps {
    Personal = 1,
    Delivery = 2,
    Review = 3,
}

export const schema = z.object({
    name: z.string(),
    address: z.string(),
    guest: z.boolean(),
});
```

Next import the `useForm` hook &ndash; it accepts all of the same [`useFormik` (`Formik`) arguments](https://formik.org/docs/api/useFormik):

```tsx
const form = useForm({
    validateOnBlur: false,
    validateOnChange: false,
    initialValues: { name: '', address: '', guest: false },
    onSubmit(values: Schema) {
        console.log(values);
    },
});
```

You can now use `form` to access [all of the usual](https://formik.org/docs/api/formik#props-1) Formik properties such as `form.values` and `form.errors`.

## Step Component

Multi-step forms are created using the `<Step>` component. Each step defines its order in the sequence and which fields belong to it:

```tsx
<Form controller={form}>
    <form onSubmit={form.handleSubmit}>
        <Step initial order={Steps.Personal}>
            <Field name="name" validate={schema.shape.name}>
                <input type="text" {...form.getFieldProps('name')} />
            </Field>
        </Step>

        <Step order={Steps.Delivery}>
            <Field name="address" validate={schema.shape.address}>
                <input type="text" {...form.getFieldProps('address')} />
            </Field>
        </Step>
    </form>
</Form>
```

### Step Props

| Prop | Type | Description |
|------|------|-------------|
| `order` | `number` | The step's position in the sequence (lower numbers come first) |
| `initial` | `boolean` | Whether this is the starting step (default: `false`) |

Steps are automatically sorted by their `order` value. You can use any numeric values including negative numbers or `Infinity`.

### Automatic Step Skipping

Steps that contain no `<Field>` children are automatically skipped during navigation. This allows for dynamic multi-step forms:

```tsx
<Step order={Steps.Delivery}>
    {form.values.guest && (
        <Field name="address" validate={schema.shape.address}>
            <input type="text" {...form.getFieldProps('address')} />
        </Field>
    )}
</Step>
```

When `guest` is `false`, the Delivery step has no fields and will be skipped when navigating.

## Field Component

The `<Field>` component registers form fields with Formikate:

```tsx
<Field name="name" validate={schema.shape.name}>
    <input type="text" {...form.getFieldProps('name')} />
</Field>
```

### Field Props

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | The field name (must match a key in `initialValues`) |
| `validate` | `ZodType` | Zod schema for validation |
| `initial` | `any` | Initial value when field mounts (optional) |
| `hidden` | `boolean` | Hide the field but retain its value (default: `false`) |
| `virtual` | `boolean` | No validation, just marks a step as having content |

### Virtual Fields

Use `virtual` for steps that display data but don't collect input:

```tsx
<Step order={Steps.Review}>
    <Field virtual>
        <ul>
            <li>Name: {form.values.name}</li>
            <li>Address: {form.values.address}</li>
        </ul>
    </Field>
</Step>
```

## Navigation

Control form navigation using the form controller:

```tsx
// In your onSubmit handler
onSubmit(values: Schema) {
    if (form.isStep(Steps.Review)) {
        console.log('Submitting', values);
    } else {
        form.handleNext();
    }
}
```

### Navigation Methods

| Method | Description |
|--------|-------------|
| `form.handleNext()` | Navigate to the next step |
| `form.handlePrevious()` | Navigate to the previous step |
| `form.handleGoto(step)` | Navigate to a specific step |
| `form.isStep(step)` | Check if the current step matches |

### Navigation Buttons

```tsx
<button
    type="button"
    disabled={!form.isPrevious || form.isSubmitting}
    onClick={form.handlePrevious}
>
    Back
</button>

<button type="submit" disabled={form.isSubmitting}>
    {form.isStep(Steps.Review) ? 'Submit' : 'Next'}
</button>
```

## Progress Indicator

Display step progress using `form.progress`:

```tsx
<ul>
    {form.progress.map((progress) => (
        <li key={progress.step} className={progress.current ? 'active' : ''}>
            Step {progress.step}
        </li>
    ))}
</ul>
```

## Empty State

When all fields are conditionally hidden, use `form.isEmpty` to render a fallback:

```tsx
<Form controller={form}>
    {form.isEmpty ? (
        <p>No fields available</p>
    ) : (
        <form onSubmit={form.handleSubmit}>
            {showFields && (
                <Step initial order={1}>
                    <Field name="name" validate={schema.shape.name}>
                        <input type="text" {...form.getFieldProps('name')} />
                    </Field>
                </Step>
            )}
        </form>
    )}
</Form>
```

## Utility Methods

| Method | Description |
|--------|-------------|
| `form.isEmpty` | Whether the form has no registered fields |
| `form.isVisible(name)` | Check if a field is currently rendered |
| `form.isRequired(name)` | Check if a field is required (based on Zod schema) |
| `form.isOptional(name)` | Check if a field is optional |
| `form.step` | Current step order value |
| `form.isPrevious` | Whether a previous step exists |
| `form.isNext` | Whether a next step exists |
