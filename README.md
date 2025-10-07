# <img src="media/icon.png" alt="Formikate" width="32" height="32" /> Formikate

🪚 Lightweight form builder for React that lets you dynamically render form fields from validation schemas, manage multi-step flows, and simplify validation handling.

## Features

- Dynamically render form fields using [`zod`](https://github.com/colinhacks/zod)
- Supports multi-step forms using the `step` property
- Fields that get hidden are reset using the `initialValues` object
- Navigates to the earliest step that contains a validation error on submit

## Getting started

Begin by defining both your validation schema and, optionally, the steps in your form:

```tsx
export const enum Steps {
    Personal,
    Delivery,
    Review,
}

export const schema = z.object({
    name: z.string(),
    address: z.string(),
    guest: z.boolean(),
});
```

Next import the `useForm` hook &ndash; it accepts all of the same [`useFormik` (`Formik`) arguments](https://formik.org/docs/api/useFormik) with the addition of two more:

- `initialStep`: Step to initially start on when rendering the form.
- `stepSequence`: Logical sequence of the steps.

Note that if you change `stepSequence` after rendering the form and you have multiple steps, it will reset the form back to the `initialStep` or the first step in the sequence. Also note that `stepSequence` has zero effect on which steps are visible &ndash; that is determined by the `Field` components later on.

```tsx
const form = useForm({
    initialStep: Steps.Personal,
    stepSequence: [Steps.Personal, Steps.Delivery, Steps.Review],
    validateOnBlur: false,
    validateOnChange: false,
    initialValues: { name: '', address: '', guest: false },
    onSubmit(values: Schema) {
        console.log(values);
    },
});
```

You can now use `form` to access [all of the usual](https://formik.org/docs/api/formik#props-1) Formik properties such as `form.values` and `form.errors`.

Next we can begin rendering our `Form` and `Field` components, conditionally or otherwise, and the rendering of these components determines which fields are applicable to your form based on the current state. Pass in the `form` to the `config` parameter of `Form` and any other [`form` attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form) along with the submit handler.

```tsx
<Form config={form} onSubmit={form.handleSubmit}>
    <Field name="name" step={Steps.Personal} validate={schema.shape.name}>
        <input type="text" {...form.getFieldProps('name')} />
    </Field>

    <Field name="address" step={Steps.Delivery} validate={schema.shape.address}>
        <input type="address" {...form.getFieldProps('address')} />
    </Field>
</Form>
```

In the above case the form will be rendered as two steps, within the submit handler you can check which step has been submitted, assuming there are no validation errors, and determine whether to submit the form to the backend or move to the next step using `form.handleNext()`, for example you might do:

```tsx
onSubmit(values: Schema) {
    if (form.step === Steps.Review) console.log('Submitting', values);
    else form.handleNext();
}
```

However you may have noticed we have a `guest` parameter as well, using that we can conditionally show the `address` field &ndash; if a user is a guest we need to ask for the address, otherwise we'll know their address from their user profile. When we conditionally render `address` the validation schema and values will be kept in sync.

```tsx
<Form config={form} onSubmit={form.handleSubmit}>
    <Field name="guest" step={Steps.Personal} validate={schema.shape.guest}>
        <input type="checkbox" {...form.getFieldProps('guest')} />
    </Field>

    <Field name="name" step={Steps.Personal} validate={schema.shape.name}>
        <input type="text" {...form.getFieldProps('name')} />
    </Field>

    {form.values.guest && (
        <Field
            name="address"
            step={Steps.Delivery}
            validate={schema.shape.address}
        >
            <input type="address" {...form.getFieldProps('address')} />
        </Field>
    )}
</Form>
```

Note that if you want to just hide the `Field` and retain its value then you can use the `hidden` property.

When the user selects they are a guest, our form becomes a two step form, otherwise it's a one step form. However you'll also notice we have a review step which we also need to incorporate to make our form either a two or three step form:

```tsx
<Field virtual step={Steps.Review}>
    <ul>
        <li>Guest: {form.values.guest ? 'Yes' : 'No'}</li>
        <li>Name: {form.values.name}</li>
        <li>Address: {form.values.address}</li>
    </ul>
</Field>
```

By using the `virtual` property on the `Field` component we can instruct Formikate that there's no validation to be applied but it still shows up as a step in our form.

Last of all we need to add the buttons to our form for the user to navigate and submit:

```tsx
<>
    <button
        type="button"
        disabled={!form.isPrevious}
        onClick={form.handlePrevious}
    >
        Back
    </button>

    <button type="submit" disabled={form.isSubmitting}>
        {form.step === Steps.Review ? 'Submit' : 'Next'}
    </button>
</>
```

We can also display a nice list of the current form steps using the `form.progress` vector and for that we may also want to give our `Step` enum actual labels:

```tsx
export const enum Steps {
    Personal = 'Personal',
    Delivery = 'Delivery',
    Review = 'Review',
}

// ...

<ul>
    {form.progress.map((progress) => (
        <li key={progress.step} className={progress.current ? 'active' : ''}>
            {progress.step}
        </li>
    ))}
</ul>;
```
