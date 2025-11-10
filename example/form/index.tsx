/** @jsxImportSource @emotion/react */
import { Form, Field, useForm } from '../../src';
import { ReactElement } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import { config, schema, Steps } from './utils.js';
import * as styles from './styles.js';

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
            await new Promise((ƒ) => setTimeout(ƒ, 2_000));
            if (form.step !== Steps.Review) {
                form.handleNext();
            } else {
                console.log('Submitting', values);
                toast.success('Form submitted successfully!', {
                    duration: 4000,
                    position: 'top-center',
                });
            }
        },
    });

    return (
        <Form controller={form}>
            <Toaster toastOptions={styles.toast} />
            <div css={styles.container}>
                <div>
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
                    </form>
                </div>

                <div css={styles.sidebar}>
                    <h3 css={styles.heading}>Form State</h3>

                    <div css={styles.section}>
                        <h4 css={styles.subtitle}>Current Step</h4>
                        <div css={styles.current}>{form.step}</div>
                    </div>

                    <div css={styles.section}>
                        <h4 css={styles.subtitle}>Progress</h4>
                        <Progress />
                    </div>

                    <div>
                        <h4 css={styles.subtitle}>Form Values</h4>
                        <div css={styles.values}>
                            {JSON.stringify(form.values, null, 2)}
                        </div>
                    </div>
                </div>
            </div>
        </Form>
    );
}
