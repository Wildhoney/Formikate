import * as z from 'zod';
import { Form, Field, useFormikate } from '../../src';
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
                    <Field name="name" step={Steps.Name} validate={schema.shape.name}>
                        {/* <Name /> */}
                        <div>Name</div>
                    </Field>

                    <Field name="age" step={Steps.Name} validate={schema.shape.age}>
                        {/* <Age /> */}
                        <div>Age</div>
                    </Field>

                    <Field name="telephone" step={Steps.Address} validate={schema.shape.telephone}>
                        {/* <Telephone /> */}
                        <div>Telephone</div>
                    </Field>

                    <button type="button" disabled={!formikate.hasPrevious} onClick={formikate.previous}>
                        Back
                    </button>

                    <button type="submit">{formikate.step === Steps.Review ? 'Submit' : 'Next'}</button>
                </form>
            )}
        </Form>
    );
}
