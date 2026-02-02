/** @jsxImportSource @emotion/react */
import { Form, Field, useForm, Step } from '../../src';
import { ReactElement, useRef, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Carousel } from 'antd';
import type { CarouselRef } from 'antd/es/carousel';

import { config, schema, Steps, getIndex, carouselConfig } from './utils.js';
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
    const carousel = useRef<CarouselRef>(null);

    const form = useForm({
        ...config,
        async onSubmit(values: Schema) {
            await new Promise((f) => setTimeout(f, 2_000));
            if (!form.isStep(Steps.Review)) {
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

    

    useEffect(() => {
        if (form.step !== null && carousel.current) {
            const index = getIndex[form.step];
            if (index !== undefined) {
                carousel.current.goTo(index);
            }
        }
    }, [form.step]);

    return (
        <Form controller={form}>
            <Toaster toastOptions={styles.toast} />
            
            <div css={styles.container}>
                <div css={styles.formSection}>
                    <form onSubmit={form.handleSubmit}>
                        <Preview />

                        <Carousel
                            ref={carousel}
                            {...carouselConfig}
                            css={styles.carousel}
                        >
                            <div>
                                <Step initial order={Steps.Name}>
                                    <Field
                                        name="name"
                                        initial=""
                                        validate={schema.shape.name}
                                    >
                                        <Name />
                                    </Field>

                                    <Field
                                        name="guest"
                                        validate={schema.shape.guest}
                                    >
                                        <Guest />
                                    </Field>

                                    {form.values.guest === false && (
                                        <Field
                                            name="age"
                                            validate={schema.shape.age}
                                        >
                                            <Age />
                                        </Field>
                                    )}
                                </Step>
                            </div>

                            <div>
                                <Step order={Steps.Address}>
                                    {form.values.guest === false && (
                                        <Field
                                            name="telephone"
                                            validate={schema.shape.telephone}
                                        >
                                            <Telephone />
                                        </Field>
                                    )}
                                </Step>
                            </div>

                            <div>
                                <Step order={Steps.Review}>
                                    <Field virtual>
                                        <Review />
                                    </Field>
                                </Step>
                            </div>
                        </Carousel>

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
