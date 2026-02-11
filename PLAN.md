# Formikate v2 API

```tsx
// 1. Basic form - Formik wrapper
const form = useForm({
  onSubmit: async (values) => { ... },
});

// 2. Hooks that need form values
const derived = useX(form);
const userTier = useUserTier(form.values.userId);

// 3. Structure declaration - has access to everything above
const fields = useFields(form, () => ({
  steps: [
    Steps.Name,
    Steps.Address,
    ...(derived.showReview ? [Steps.Review] : []),
  ],
  fields: {
    name: { step: Steps.Name, validate: schema.shape.name, value: '' },
    guest: { step: Steps.Name, validate: schema.shape.guest, value: null },
    age: { step: Steps.Name, validate: schema.shape.age, value: null, active: form.values.guest === false },
    telephone: { step: Steps.Address, validate: schema.shape.telephone, value: '', active: form.values.guest === false },
    premium: { step: Steps.Address, validate: schema.shape.premium, value: '', active: userTier === 'premium' },
  },
}));

// 4. Use in JSX
<Routes>
  <Route path="/step/name" element={
    <>
      <Input name="name" />
      <Checkbox name="guest" />
      {fields.field.age.visible && <Input name="age" />}
    </>
  } />
  <Route path="/step/address" element={
    <>
      {fields.field.telephone.visible && <Input name="telephone" />}
      {fields.field.premium.visible && <Input name="premium" />}
    </>
  } />
</Routes>

<nav>
  {fields.steps.map(step => (
    <button onClick={() => fields.goto.navigate(step.id)} disabled={!fields.goto.exists(step.id)} aria-current={fields.step[step.id].current}>
      {step.id}
    </button>
  ))}
</nav>

<button disabled={!fields.previous.exists} onClick={fields.previous.navigate}>Back</button>
<button disabled={!fields.next.exists} onClick={fields.next.navigate}>Next</button>
```

## `useFields` Returns

```tsx
// Steps
fields.steps; // [{ id, index }, ...]
fields.step.name.visible; // Is step in current steps array?
fields.step.name.current; // Is this the current step?

// Fields
fields.field.age.visible; // Is field active/visible?

// Field Reset Behavior
// When a field becomes hidden (active: false), its value resets in this order:
// 1. field.value (from useFields config)
// 2. form.initialValues[fieldName] (from useForm)
// 3. undefined

// Progress
fields.progress.total; // Total number of steps
fields.progress.current; // Current step (e.g. Steps.Name)
fields.progress.position; // Current step index (0-based)
fields.progress.first; // Is on first step?
fields.progress.last; // Is on last step?

// Navigation
fields.previous.exists; // Can go back?
fields.previous.navigate(); // Navigate back
fields.next.exists; // Can go next?
fields.next.navigate(); // Navigate forward
fields.goto.exists(id); // Is step visible/navigable?
fields.goto.navigate(id); // Jump to step
```
