import * as z from 'zod';
import { Form, Field, useFormikate } from '../../src';
import { ReactElement, useCallback } from 'react';

const enum Steps {
    Name = 'name',
    Address = 'address',
    Review = 'review',
}

const schema = z.object({
    name: z.string().min(1).max(100),
    guest: z.boolean().optional(),
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
        async (values: Schema) => {
            await new Promise((r) => setTimeout(r, 2000));

            if (formikate.step === Steps.Review) {
                return void console.log('Submitting', values);
            }

            formikate.next();
        },
        [formikate],
    );

    return (
        <Form
            initialValues={{ name: '', guest: false, age: '', telephone: '' }}
            validateOnBlur={false}
            validateOnChange={false}
            validationSchema={formikate}
            onSubmit={handleSubmit}
        >
            {(props) => (
                <form
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        alignItems: 'flex-start',
                    }}
                    onSubmit={props.handleSubmit}
                >
                    <Field
                        name="name"
                        step={Steps.Name}
                        validate={schema.shape.name}
                    >
                        <label>Name</label>
                        <input type="text" {...props.getFieldProps('name')} />
                        <div>{props.errors.name}</div>
                    </Field>

                    <Field
                        name="guest"
                        step={Steps.Name}
                        validate={schema.shape.guest}
                    >
                        <label>
                            <input
                                type="checkbox"
                                {...props.getFieldProps('guest')}
                                checked={props.values.guest}
                            />
                            Continue as a guest?
                        </label>
                    </Field>

                    {props.values.guest === false && (
                        <Field
                            name="age"
                            step={Steps.Name}
                            validate={schema.shape.age}
                        >
                            <label>Age</label>
                            <input
                                type="text"
                                {...props.getFieldProps('age')}
                            />
                            <div>{props.errors.age}</div>
                        </Field>
                    )}

                    <Field virtual step={Steps.Review}>
                        Review
                        <pre>{JSON.stringify(props.values, null, 2)}</pre>
                    </Field>

                    {props.values.guest === false && (
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

                    <section>
                        <button
                            type="button"
                            disabled={!formikate.isPrevious}
                            onClick={formikate.previous}
                        >
                            Back
                        </button>

                        <button type="submit" disabled={props.isSubmitting}>
                            {formikate.step === Steps.Review
                                ? 'Submit'
                                : 'Next'}
                        </button>

                        <button
                            type="button"
                            onClick={() => formikate.goto(Steps.Name)}
                        >
                            Reset
                        </button>
                    </section>

                    <pre>{JSON.stringify(formikate.progress, null, 2)}</pre>
                </form>
            )}
        </Form>
    );
}
