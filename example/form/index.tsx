import * as z from 'zod';
import { Form, Field, useFormikate, Section } from '../../src';
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
            initialValues={{ name: '', age: '6', telephone: '' }}
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

                    <Section step={Steps.Review}>Review</Section>

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
