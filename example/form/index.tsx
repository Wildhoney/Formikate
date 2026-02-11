/** @jsxImportSource @emotion/react */
import { useForm, useFields, Form, Position } from '../../src';
import { ReactElement, useRef, useEffect, ComponentRef } from 'react';
import { Carousel } from 'antd';
import toast, { Toaster } from 'react-hot-toast';

import { config, fields } from './utils.js';
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
    const carousel = useRef<ComponentRef<typeof Carousel>>(null);

    const form = useForm<Schema>({
        ...config,
        fields,
        async onSubmit(values: Schema) {
            await new Promise((f) => setTimeout(f, 2_000));
            if (!form.status.progress.last)
                return void form.status.navigate.to(Position.Next);
            else {
                console.log('Submitting', values);

                return void toast.success('Form submitted successfully!', {
                    duration: 4_000,
                    position: 'top-center',
                });
            }
        },
    });

    useFields(form, () => ({
        steps: ['name', 'address', 'review'],
        fields: {
            ...fields,
            age: {
                ...fields.age,
                active: form.values.guest === false,
            },
            telephone: {
                ...fields.telephone,
                active: form.values.guest === false,
            },
        },
    }));

    useEffect(() => {
        if (carousel.current)
            carousel.current.goTo(form.status.progress.position);
    }, [form.status.progress.position]);

    return (
        <Form value={form}>
            <div css={styles.container}>
                <div css={styles.formSection}>
                    <form onSubmit={form.handleSubmit}>
                        <Preview step={form.status.progress.current} />

                        <Carousel
                            ref={carousel}
                            {...config.carousel}
                            css={styles.carousel}
                        >
                            <div>
                                <Name />
                                <Guest />
                                {form.status.field.age.exists() && <Age />}
                            </div>

                            <div>
                                {form.status.field.telephone.exists() && (
                                    <Telephone />
                                )}
                            </div>

                            <div>
                                <Review />
                            </div>
                        </Carousel>

                        <Buttons fields={form.status} />
                    </form>
                </div>

                <div css={styles.sidebar}>
                    <h3 css={styles.heading}>Form State</h3>

                    <div css={styles.section}>
                        <h4 css={styles.subtitle}>Current Step</h4>
                        <div css={styles.current}>
                            {form.status.progress.current}
                        </div>
                    </div>

                    <div css={styles.section}>
                        <h4 css={styles.subtitle}>Progress</h4>
                        <Progress fields={form.status} />
                    </div>

                    <div>
                        <h4 css={styles.subtitle}>Form Values</h4>
                        <div css={styles.values}>
                            {JSON.stringify(form.values, null, 2)}
                        </div>
                    </div>
                </div>
            </div>

            <Toaster toastOptions={styles.toast} />
        </Form>
    );
}
