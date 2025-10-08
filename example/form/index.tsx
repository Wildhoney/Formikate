import { Form, Field, useForm } from '../../src';
import { ReactElement } from 'react';

import { config, schema, Steps } from './utils.js';

import type { Schema } from './types.js';
import Age from './components/age/index.js';
import Buttons from './components/buttons/index.js';
import Guest from './components/guest/index.js';
import Name from './components/name/index.js';
import Preview from './components/preview/index.js';
import Progress from './components/progress/index.js';
import Review from './components/review/index.js';
import Telephone from './components/telephone/index.js';

export default function Details(): ReactElement {
    const form = useForm({
        ...config,
        async onSubmit(values: Schema) {
            await new Promise((ƒ) => setTimeout(ƒ, 2000));
            if (form.step !== Steps.Review) form.handleNext();
            else return void console.log('Submitting', values);
        },
    });

    return (
        <Form controller={form}>
            <form onSubmit={form.handleSubmit}>
                <Preview />

                <Field
                    name="name"
                    step={Steps.Name}
                    validate={schema.shape.name}
                >
                    <Name />
                </Field>

                <Field
                    name="guest"
                    step={Steps.Name}
                    validate={schema.shape.guest}
                >
                    <Guest />
                </Field>

                {form.values.guest === false && (
                    <Field
                        name="age"
                        step={Steps.Name}
                        validate={schema.shape.age}
                    >
                        <Age />
                    </Field>
                )}

                {form.values.guest === false && (
                    <Field
                        name="telephone"
                        step={Steps.Address}
                        validate={schema.shape.telephone}
                    >
                        <Telephone />
                    </Field>
                )}

                <Field virtual step={Steps.Review}>
                    <Review />
                </Field>

                <Buttons />

                <Progress />
            </form>
        </Form>
    );
}
