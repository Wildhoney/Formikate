import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { faker } from '@faker-js/faker';
import * as z from 'zod';
import * as React from 'react';
import { useForm, Form, Field, Step } from './index.js';

afterEach(() => {
    cleanup();
});

describe('Field Component', () => {
    describe('initial prop behavior', () => {
        it('should set field value to initial on mount', () => {
            const initialFieldValue = faker.person.fullName();
            const initialName = faker.person.fullName();

            function TestForm() {
                const form = useForm({
                    initialValues: { name: initialName },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field
                            name="name"
                            validate={z.string()}
                            initial={initialFieldValue}
                        >
                            <input
                                data-testid="name-input"
                                {...form.getFieldProps('name')}
                            />
                        </Field>
                    </Form>
                );
            }

            render(<TestForm />);
            const input = screen.getByTestId('name-input') as HTMLInputElement;
            expect(input.value).toBe(initialFieldValue);
        });

        it('should reset to initial value on unmount', async () => {
            const initialFieldValue = faker.person.fullName();
            const changedName = faker.person.fullName();

            function TestForm() {
                const [showField, setShowField] = React.useState(true);
                const form = useForm({
                    initialValues: { name: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        {showField && (
                            <Field
                                name="name"
                                validate={z.string()}
                                initial={initialFieldValue}
                            >
                                <input
                                    data-testid="name-input"
                                    {...form.getFieldProps('name')}
                                />
                            </Field>
                        )}
                        <button
                            data-testid="toggle-button"
                            onClick={() => setShowField((prev) => !prev)}
                        >
                            Toggle
                        </button>
                        <div data-testid="form-value">{form.values.name}</div>
                    </Form>
                );
            }

            const { getByTestId } = render(<TestForm />);
            const input = getByTestId('name-input') as HTMLInputElement;

            expect(input.value).toBe(initialFieldValue);

            input.value = changedName;
            input.dispatchEvent(new Event('change', { bubbles: true }));

            getByTestId('toggle-button').click();

            await waitFor(() => {
                expect(getByTestId('form-value').textContent).toBe(initialFieldValue);
            });
        });

        it('should reset to initialValue when no initial is provided', async () => {
            const initialName = faker.person.fullName();
            const changedName = faker.person.fullName();

            function TestForm() {
                const [showField, setShowField] = React.useState(true);
                const form = useForm({
                    initialValues: { name: initialName },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        {showField && (
                            <Field name="name" validate={z.string()}>
                                <input
                                    data-testid="name-input"
                                    {...form.getFieldProps('name')}
                                />
                            </Field>
                        )}
                        <button
                            data-testid="toggle-button"
                            onClick={() => setShowField((prev) => !prev)}
                        >
                            Toggle
                        </button>
                        <div data-testid="form-value">{form.values.name}</div>
                    </Form>
                );
            }

            const { getByTestId } = render(<TestForm />);
            const input = getByTestId('name-input') as HTMLInputElement;

            input.value = changedName;
            input.dispatchEvent(new Event('change', { bubbles: true }));

            getByTestId('toggle-button').click();

            await waitFor(() => {
                expect(getByTestId('form-value').textContent).toBe(initialName);
            });
        });

        it('should handle numeric initial values', () => {
            const initialAge = faker.number.int({ min: 18, max: 100 });

            function TestForm() {
                const form = useForm({
                    initialValues: { age: 0 },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field
                            name="age"
                            validate={z.number()}
                            initial={initialAge}
                        >
                            <input
                                type="number"
                                data-testid="age-input"
                                {...form.getFieldProps('age')}
                            />
                        </Field>
                    </Form>
                );
            }

            render(<TestForm />);
            const input = screen.getByTestId('age-input') as HTMLInputElement;
            expect(Number(input.value)).toBe(initialAge);
        });

        it('should handle boolean initial values', () => {
            const initialChecked = faker.datatype.boolean();

            function TestForm() {
                const form = useForm({
                    initialValues: { subscribe: false },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field
                            name="subscribe"
                            validate={z.boolean()}
                            initial={initialChecked}
                        >
                            <input
                                type="checkbox"
                                data-testid="subscribe-input"
                                {...form.getFieldProps('subscribe')}
                            />
                        </Field>
                        <div data-testid="form-value">
                            {String(form.values.subscribe)}
                        </div>
                    </Form>
                );
            }

            render(<TestForm />);
            const formValue = screen.getByTestId('form-value');
            expect(formValue.textContent).toBe(String(initialChecked));
        });

        it('should handle complex object initial values', () => {
            const initialAddress = {
                street: faker.location.streetAddress(),
                city: faker.location.city(),
                zip: faker.location.zipCode(),
            };

            function TestForm() {
                const form = useForm({
                    initialValues: { address: {} },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field
                            name="address"
                            validate={z.object({
                                street: z.string(),
                                city: z.string(),
                                zip: z.string(),
                            })}
                            initial={initialAddress}
                        >
                            <div data-testid="address-display">
                                {JSON.stringify(form.values.address)}
                            </div>
                        </Field>
                    </Form>
                );
            }

            render(<TestForm />);
            const display = screen.getByTestId('address-display');
            expect(display.textContent).toBe(JSON.stringify(initialAddress));
        });
    });

    describe('Step component behavior', () => {
        it('should navigate between steps with fields', async () => {
            function TestForm() {
                const form = useForm({
                    initialValues: { name: '', address: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Step initial order={1}>
                            <Field name="name" validate={z.string()}>
                                <input data-testid="name-input" />
                            </Field>
                        </Step>
                        <Step order={2}>
                            <Field name="address" validate={z.string()}>
                                <input data-testid="address-input" />
                            </Field>
                        </Step>
                        <button
                            data-testid="next-button"
                            onClick={form.handleNext}
                        >
                            Next
                        </button>
                        <div data-testid="current-step">{form.step}</div>
                    </Form>
                );
            }

            const { getByTestId } = render(<TestForm />);

            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe('1');
            });

            getByTestId('next-button').click();

            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe('2');
            });
        });

        it('should skip steps with no fields', async () => {
            function TestForm() {
                const [showStep2Field] = React.useState(false);
                const form = useForm({
                    initialValues: { name: '', address: '', review: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Step initial order={1}>
                            <Field name="name" validate={z.string()}>
                                <input data-testid="name-input" />
                            </Field>
                        </Step>
                        <Step order={2}>
                            {showStep2Field && (
                                <Field name="address" validate={z.string()}>
                                    <input data-testid="address-input" />
                                </Field>
                            )}
                        </Step>
                        <Step order={3}>
                            <Field name="review" validate={z.string()}>
                                <input data-testid="review-input" />
                            </Field>
                        </Step>
                        <button
                            data-testid="next-button"
                            onClick={form.handleNext}
                        >
                            Next
                        </button>
                        <div data-testid="current-step">{form.step}</div>
                    </Form>
                );
            }

            const { getByTestId } = render(<TestForm />);

            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe('1');
            });

            getByTestId('next-button').click();

            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe('3');
            });
        });

        it('should handle initial prop change to reset step', async () => {
            function TestForm() {
                const [resetToStep2, setResetToStep2] = React.useState(false);
                const form = useForm({
                    initialValues: { name: '', address: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Step initial={!resetToStep2} order={1}>
                            <Field name="name" validate={z.string()}>
                                <input data-testid="name-input" />
                            </Field>
                        </Step>
                        <Step initial={resetToStep2} order={2}>
                            <Field name="address" validate={z.string()}>
                                <input data-testid="address-input" />
                            </Field>
                        </Step>
                        <button
                            data-testid="next-button"
                            onClick={form.handleNext}
                        >
                            Next
                        </button>
                        <button
                            data-testid="reset-to-step2"
                            onClick={() => setResetToStep2(true)}
                        >
                            Reset to Step 2
                        </button>
                        <div data-testid="current-step">{form.step}</div>
                    </Form>
                );
            }

            const { getByTestId } = render(<TestForm />);

            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe('1');
            });

            getByTestId('reset-to-step2').click();

            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe('2');
            });
        });
    });

    describe('hidden prop behavior', () => {
        it('should not render children when hidden is true', () => {
            function TestForm() {
                const form = useForm({
                    initialValues: { name: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field name="name" validate={z.string()} hidden={true}>
                            <input data-testid="name-input" />
                        </Field>
                    </Form>
                );
            }

            render(<TestForm />);
            expect(screen.queryByTestId('name-input')).not.toBeInTheDocument();
        });

        it('should retain field value when hidden', async () => {
            const testValue = faker.person.fullName();

            function TestForm() {
                const [isHidden, setIsHidden] = React.useState(false);
                const form = useForm({
                    initialValues: { name: testValue },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field
                            name="name"
                            validate={z.string()}
                            hidden={isHidden}
                        >
                            <input
                                data-testid="name-input"
                                {...form.getFieldProps('name')}
                            />
                        </Field>
                        <button
                            data-testid="toggle-button"
                            onClick={() => setIsHidden((prev) => !prev)}
                        >
                            Toggle
                        </button>
                        <div data-testid="form-value">{form.values.name}</div>
                    </Form>
                );
            }

            const { getByTestId, queryByTestId } = render(<TestForm />);
            expect(queryByTestId('name-input')).toBeInTheDocument();
            expect(getByTestId('form-value').textContent).toBe(testValue);

            getByTestId('toggle-button').click();

            await waitFor(() => {
                expect(queryByTestId('name-input')).not.toBeInTheDocument();
                expect(getByTestId('form-value').textContent).toBe(testValue);
            });
        });
    });

    describe('virtual field behavior', () => {
        it('should render virtual field without validation', () => {
            function TestForm() {
                const form = useForm({
                    initialValues: {},
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Step initial order={1}>
                            <Field virtual>
                                <div data-testid="review-content">Review</div>
                            </Field>
                        </Step>
                    </Form>
                );
            }

            render(<TestForm />);
            expect(screen.queryByTestId('review-content')).toBeInTheDocument();
        });

        it('should count virtual fields in step field count', async () => {
            function TestForm() {
                const form = useForm({
                    initialValues: { name: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Step initial order={1}>
                            <Field name="name" validate={z.string()}>
                                <input data-testid="name-input" />
                            </Field>
                        </Step>
                        <Step order={2}>
                            <Field virtual>
                                <div data-testid="review-content">Review</div>
                            </Field>
                        </Step>
                        <button
                            data-testid="next-button"
                            onClick={form.handleNext}
                        >
                            Next
                        </button>
                        <div data-testid="current-step">{form.step}</div>
                    </Form>
                );
            }

            const { getByTestId } = render(<TestForm />);

            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe('1');
            });

            getByTestId('next-button').click();

            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe('2');
            });
        });
    });

    describe('multiple fields behavior', () => {
        it('should handle multiple fields independently', () => {
            const initialName = faker.person.fullName();
            const initialEmail = faker.internet.email();

            function TestForm() {
                const form = useForm({
                    initialValues: { name: '', email: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field
                            name="name"
                            validate={z.string()}
                            initial={initialName}
                        >
                            <input
                                data-testid="name-input"
                                {...form.getFieldProps('name')}
                            />
                        </Field>
                        <Field
                            name="email"
                            validate={z.string()}
                            initial={initialEmail}
                        >
                            <input
                                data-testid="email-input"
                                {...form.getFieldProps('email')}
                            />
                        </Field>
                    </Form>
                );
            }

            render(<TestForm />);
            const nameInput = screen.getByTestId(
                'name-input',
            ) as HTMLInputElement;
            const emailInput = screen.getByTestId(
                'email-input',
            ) as HTMLInputElement;

            expect(nameInput.value).toBe(initialName);
            expect(emailInput.value).toBe(initialEmail);
        });

        it('should unmount multiple fields independently', async () => {
            const initialName = faker.person.fullName();
            const initialEmail = faker.internet.email();

            function TestForm() {
                const [showName, setShowName] = React.useState(true);
                const [showEmail, setShowEmail] = React.useState(true);
                const form = useForm({
                    initialValues: { name: '', email: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        {showName && (
                            <Field
                                name="name"
                                validate={z.string()}
                                initial={initialName}
                            >
                                <input data-testid="name-input" />
                            </Field>
                        )}
                        {showEmail && (
                            <Field
                                name="email"
                                validate={z.string()}
                                initial={initialEmail}
                            >
                                <input data-testid="email-input" />
                            </Field>
                        )}
                        <button
                            data-testid="toggle-name"
                            onClick={() => setShowName(false)}
                        >
                            Hide Name
                        </button>
                        <button
                            data-testid="toggle-email"
                            onClick={() => setShowEmail(false)}
                        >
                            Hide Email
                        </button>
                        <div data-testid="name-value">{form.values.name}</div>
                        <div data-testid="email-value">{form.values.email}</div>
                    </Form>
                );
            }

            const { getByTestId } = render(<TestForm />);

            getByTestId('toggle-name').click();

            await waitFor(() => {
                expect(getByTestId('name-value').textContent).toBe(initialName);
            });

            expect(getByTestId('email-value').textContent).toBe(initialEmail);

            getByTestId('toggle-email').click();

            await waitFor(() => {
                expect(getByTestId('email-value').textContent).toBe(
                    initialEmail,
                );
            });
        });
    });

    describe('field registration', () => {
        it('should register field on mount', () => {
            const fieldName = faker.lorem.word();

            function TestForm() {
                const form = useForm({
                    initialValues: { [fieldName]: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field name={fieldName} validate={z.string()}>
                            <input data-testid="input" />
                        </Field>
                        <div data-testid="field-exists">
                            {form.values[fieldName] !== undefined
                                ? 'exists'
                                : 'not-exists'}
                        </div>
                    </Form>
                );
            }

            render(<TestForm />);
            expect(screen.getByTestId('field-exists').textContent).toBe(
                'exists',
            );
        });

        it('should unregister field on unmount', async () => {
            const fieldName = faker.lorem.word();

            function TestForm() {
                const [showField, setShowField] = React.useState(true);
                const form = useForm({
                    initialValues: { [fieldName]: 'test' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        {showField && (
                            <Field name={fieldName} validate={z.string()}>
                                <input data-testid="input" />
                            </Field>
                        )}
                        <button
                            data-testid="toggle"
                            onClick={() => setShowField(false)}
                        >
                            Toggle
                        </button>
                        <div data-testid="field-value">
                            {form.values[fieldName]}
                        </div>
                    </Form>
                );
            }

            const { getByTestId } = render(<TestForm />);

            getByTestId('toggle').click();

            await waitFor(() => {
                expect(getByTestId('field-value').textContent).toBe('test');
            });
        });
    });

    describe('conditional rendering', () => {
        it('should handle conditionally rendered fields with initial values', async () => {
            const initialAddress = faker.location.streetAddress();

            function TestForm() {
                const form = useForm({
                    initialValues: { isGuest: false, address: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field name="isGuest" validate={z.boolean()}>
                            <input
                                type="checkbox"
                                data-testid="guest-checkbox"
                                {...form.getFieldProps('isGuest')}
                            />
                        </Field>
                        {form.values.isGuest && (
                            <Field
                                name="address"
                                validate={z.string()}
                                initial={initialAddress}
                            >
                                <input
                                    data-testid="address-input"
                                    {...form.getFieldProps('address')}
                                />
                            </Field>
                        )}
                        <div data-testid="address-value">
                            {form.values.address}
                        </div>
                    </Form>
                );
            }

            const { getByTestId, queryByTestId } = render(<TestForm />);

            expect(queryByTestId('address-input')).not.toBeInTheDocument();

            const checkbox = getByTestId('guest-checkbox') as HTMLInputElement;
            checkbox.click();

            await waitFor(() => {
                expect(queryByTestId('address-input')).toBeInTheDocument();
                expect(getByTestId('address-value').textContent).toBe(
                    initialAddress,
                );
            });
        });
    });

    describe('type safety', () => {
        it('should properly type initial value based on validation schema', () => {
            function TestForm() {
                const form = useForm({
                    initialValues: { count: 0 },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field name="count" validate={z.number()} initial={42}>
                            <input
                                type="number"
                                data-testid="count-input"
                                {...form.getFieldProps('count')}
                            />
                        </Field>
                    </Form>
                );
            }

            render(<TestForm />);
            const input = screen.getByTestId('count-input') as HTMLInputElement;
            expect(Number(input.value)).toBe(42);
        });
    });

    describe('deferred navigation', () => {
        it('should navigate to correct step after field mount/unmount changes', async () => {
            function TestForm() {
                const form = useForm({
                    initialValues: { guest: false, name: '', address: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Step initial order={1}>
                            <Field name="name" validate={z.string()}>
                                <input data-testid="name-input" />
                            </Field>

                            <Field name="guest" validate={z.boolean()}>
                                <input
                                    type="checkbox"
                                    data-testid="guest-checkbox"
                                    {...form.getFieldProps('guest')}
                                />
                            </Field>
                        </Step>

                        <Step order={2}>
                            {form.values.guest === false && (
                                <Field name="address" validate={z.string()}>
                                    <input data-testid="address-input" />
                                </Field>
                            )}
                        </Step>

                        <Step order={3}>
                            <Field virtual>
                                <div data-testid="review-content">Review</div>
                            </Field>
                        </Step>

                        <button
                            data-testid="toggle-and-next"
                            onClick={() => {
                                form.setFieldValue('guest', true);
                                form.handleNext();
                            }}
                        >
                            Toggle and Next
                        </button>

                        <div data-testid="current-step">{form.step}</div>
                    </Form>
                );
            }

            const { getByTestId } = render(<TestForm />);

            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe('1');
            });

            getByTestId('toggle-and-next').click();

            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe('3');
            });
        });

        it('should use latest step calculation when handleNext is deferred', async () => {
            function TestForm() {
                const form = useForm({
                    initialValues: { skipStep2: false },
                    onSubmit: () => {},
                });

                const handleClick = () => {
                    form.setFieldValue('skipStep2', true);
                    form.handleNext();
                };

                return (
                    <Form controller={form}>
                        <Step initial order={1}>
                            <Field name="skipStep2" validate={z.boolean()}>
                                <input
                                    type="checkbox"
                                    data-testid="skip-checkbox"
                                />
                            </Field>
                        </Step>

                        <Step order={2}>
                            {!form.values.skipStep2 && (
                                <Field name="field2" validate={z.string()}>
                                    <input data-testid="field2-input" />
                                </Field>
                            )}
                        </Step>

                        <Step order={3}>
                            <Field name="field3" validate={z.string()}>
                                <input data-testid="field3-input" />
                            </Field>
                        </Step>

                        <button data-testid="next-button" onClick={handleClick}>
                            Next
                        </button>

                        <div data-testid="current-step">{form.step}</div>
                    </Form>
                );
            }

            const { getByTestId } = render(<TestForm />);

            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe('1');
            });

            getByTestId('next-button').click();

            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe('3');
            });
        });

        it('should handle rapid handleNext calls correctly', async () => {
            function TestForm() {
                const form = useForm({
                    initialValues: { field1: '', field2: '', field3: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Step initial order={1}>
                            <Field name="field1" validate={z.string()}>
                                <input data-testid="field1-input" />
                            </Field>
                        </Step>

                        <Step order={2}>
                            <Field name="field2" validate={z.string()}>
                                <input data-testid="field2-input" />
                            </Field>
                        </Step>

                        <Step order={3}>
                            <Field name="field3" validate={z.string()}>
                                <input data-testid="field3-input" />
                            </Field>
                        </Step>

                        <button
                            data-testid="next-button"
                            onClick={form.handleNext}
                        >
                            Next
                        </button>

                        <div data-testid="current-step">{form.step}</div>
                    </Form>
                );
            }

            const { getByTestId } = render(<TestForm />);

            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe('1');
            });

            getByTestId('next-button').click();

            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe('2');
            });

            getByTestId('next-button').click();

            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe('3');
            });
        });

        it('should handle onSubmit that changes fields then calls handleNext', async () => {
            function TestForm() {
                const form = useForm({
                    initialValues: {
                        shouldShowExtra: false,
                        name: 'test',
                        extra: '',
                    },
                    onSubmit: async () => {
                        form.setFieldValue('shouldShowExtra', true);
                        if (!form.isStep(3)) {
                            form.handleNext();
                        }
                    },
                });

                return (
                    <Form controller={form}>
                        <form onSubmit={form.handleSubmit}>
                            <Step initial order={1}>
                                <Field name="name" validate={z.string()}>
                                    <input
                                        data-testid="name-input"
                                        {...form.getFieldProps('name')}
                                    />
                                </Field>
                            </Step>

                            <Step order={2}>
                                {form.values.shouldShowExtra && (
                                    <Field
                                        name="extra"
                                        validate={z.string().optional()}
                                    >
                                        <input data-testid="extra-input" />
                                    </Field>
                                )}
                            </Step>

                            <Step order={3}>
                                <Field virtual>
                                    <div data-testid="review-content">Review</div>
                                </Field>
                            </Step>

                            <button type="submit" data-testid="submit-button">
                                Submit
                            </button>

                            <div data-testid="current-step">{form.step}</div>
                        </form>
                    </Form>
                );
            }

            const { getByTestId } = render(<TestForm />);

            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe('1');
            });

            getByTestId('submit-button').click();

            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe('2');
            });
        });
    });

    describe('nested field warning', () => {
        it('should warn when Field components are nested', () => {
            const warnSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            function TestForm() {
                const form = useForm({
                    initialValues: { parent: '', child: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field name="parent" validate={z.string()}>
                            <Field name="child" validate={z.string()}>
                                <input data-testid="child-input" />
                            </Field>
                        </Field>
                    </Form>
                );
            }

            render(<TestForm />);

            expect(warnSpy).toHaveBeenCalledWith(
                '[Formikate] Field "child" is nested inside another Field — this may cause unexpected behavior.',
            );

            warnSpy.mockRestore();
        });

        it('should not warn when Field components are not nested', () => {
            const warnSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            function TestForm() {
                const form = useForm({
                    initialValues: { field1: '', field2: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field name="field1" validate={z.string()}>
                            <input data-testid="field1-input" />
                        </Field>
                        <Field name="field2" validate={z.string()}>
                            <input data-testid="field2-input" />
                        </Field>
                    </Form>
                );
            }

            render(<TestForm />);

            expect(warnSpy).not.toHaveBeenCalled();

            warnSpy.mockRestore();
        });
    });

    describe('nested Step warning', () => {
        it('should warn when Step components are nested', () => {
            const warnSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            function TestForm() {
                const form = useForm({
                    initialValues: { name: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Step initial order={1}>
                            <Step order={2}>
                                <Field name="name" validate={z.string()}>
                                    <input data-testid="name-input" />
                                </Field>
                            </Step>
                        </Step>
                    </Form>
                );
            }

            render(<TestForm />);

            expect(warnSpy).toHaveBeenCalledWith(
                '[Formikate] Step with order 2 is nested inside another Step — this may cause unexpected behavior.',
            );

            warnSpy.mockRestore();
        });
    });

    describe('isVisible() method', () => {
        it('should return false for non-existent fields', () => {
            function TestForm() {
                const form = useForm({
                    initialValues: { name: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <div data-testid="visible-result">
                            {String(form.isVisible('nonexistent'))}
                        </div>
                    </Form>
                );
            }

            render(<TestForm />);
            expect(screen.getByTestId('visible-result').textContent).toBe(
                'false',
            );
        });

        it('should return true for fields without steps', () => {
            function TestForm() {
                const form = useForm({
                    initialValues: { name: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field name="name" validate={z.string()}>
                            <input data-testid="name-input" />
                        </Field>
                        <div data-testid="visible-result">
                            {String(form.isVisible('name'))}
                        </div>
                    </Form>
                );
            }

            render(<TestForm />);
            expect(screen.getByTestId('visible-result').textContent).toBe(
                'true',
            );
        });

        it('should return true for fields on the current step', async () => {
            function TestForm() {
                const form = useForm({
                    initialValues: { name: '', email: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Step initial order={1}>
                            <Field name="name" validate={z.string()}>
                                <input data-testid="name-input" />
                            </Field>
                        </Step>
                        <Step order={2}>
                            <Field name="email" validate={z.string()}>
                                <input data-testid="email-input" />
                            </Field>
                        </Step>
                        <div data-testid="name-visible">
                            {String(form.isVisible('name'))}
                        </div>
                        <div data-testid="email-visible">
                            {String(form.isVisible('email'))}
                        </div>
                    </Form>
                );
            }

            render(<TestForm />);

            await waitFor(() => {
                expect(screen.getByTestId('name-visible').textContent).toBe('true');
                expect(screen.getByTestId('email-visible').textContent).toBe(
                    'false',
                );
            });
        });

        it('should update when step changes', async () => {
            function TestForm() {
                const form = useForm({
                    initialValues: { name: '', email: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Step initial order={1}>
                            <Field name="name" validate={z.string()}>
                                <input data-testid="name-input" />
                            </Field>
                        </Step>
                        <Step order={2}>
                            <Field name="email" validate={z.string()}>
                                <input data-testid="email-input" />
                            </Field>
                        </Step>
                        <button
                            data-testid="next-button"
                            onClick={() => form.handleNext()}
                        >
                            Next
                        </button>
                        <div data-testid="name-visible">
                            {String(form.isVisible('name'))}
                        </div>
                        <div data-testid="email-visible">
                            {String(form.isVisible('email'))}
                        </div>
                    </Form>
                );
            }

            render(<TestForm />);

            await waitFor(() => {
                expect(screen.getByTestId('name-visible').textContent).toBe('true');
                expect(screen.getByTestId('email-visible').textContent).toBe(
                    'false',
                );
            });

            screen.getByTestId('next-button').click();

            await waitFor(() => {
                expect(screen.getByTestId('name-visible').textContent).toBe(
                    'false',
                );
                expect(screen.getByTestId('email-visible').textContent).toBe(
                    'true',
                );
            });
        });

        it('should respect hidden prop (field registered but not visible)', () => {
            function TestForm() {
                const form = useForm({
                    initialValues: { name: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field name="name" validate={z.string()} hidden={true}>
                            <input data-testid="name-input" />
                        </Field>
                        <div data-testid="visible-result">
                            {String(form.isVisible('name'))}
                        </div>
                    </Form>
                );
            }

            render(<TestForm />);
            expect(screen.getByTestId('visible-result').textContent).toBe(
                'true',
            );
        });
    });

    describe('isStep() method', () => {
        it('should return true when step matches current step', async () => {
            function TestForm() {
                const form = useForm({
                    initialValues: { name: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Step initial order={1}>
                            <Field name="name" validate={z.string()}>
                                <input data-testid="name-input" />
                            </Field>
                        </Step>
                        <Step order={2}>
                            <Field name="email" validate={z.string()}>
                                <input data-testid="email-input" />
                            </Field>
                        </Step>
                        <div data-testid="is-step-1">
                            {String(form.isStep(1))}
                        </div>
                        <div data-testid="is-step-2">
                            {String(form.isStep(2))}
                        </div>
                    </Form>
                );
            }

            render(<TestForm />);

            await waitFor(() => {
                expect(screen.getByTestId('is-step-1').textContent).toBe('true');
                expect(screen.getByTestId('is-step-2').textContent).toBe('false');
            });
        });

        it('should update when step changes', async () => {
            function TestForm() {
                const form = useForm({
                    initialValues: { name: '', address: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Step initial order={1}>
                            <Field name="name" validate={z.string()}>
                                <input data-testid="name-input" />
                            </Field>
                        </Step>
                        <Step order={2}>
                            <Field name="address" validate={z.string()}>
                                <input data-testid="address-input" />
                            </Field>
                        </Step>
                        <button
                            data-testid="next-button"
                            onClick={() => form.handleNext()}
                        >
                            Next
                        </button>
                        <div data-testid="is-step-1">
                            {String(form.isStep(1))}
                        </div>
                        <div data-testid="is-step-2">
                            {String(form.isStep(2))}
                        </div>
                    </Form>
                );
            }

            render(<TestForm />);

            await waitFor(() => {
                expect(screen.getByTestId('is-step-1').textContent).toBe('true');
                expect(screen.getByTestId('is-step-2').textContent).toBe('false');
            });

            screen.getByTestId('next-button').click();

            await waitFor(() => {
                expect(screen.getByTestId('is-step-1').textContent).toBe(
                    'false',
                );
                expect(screen.getByTestId('is-step-2').textContent).toBe(
                    'true',
                );
            });
        });

        it('should work with numeric steps', async () => {
            function TestForm() {
                const form = useForm({
                    initialValues: { name: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Step initial order={1}>
                            <Field name="name" validate={z.string()}>
                                <input data-testid="name-input" />
                            </Field>
                        </Step>
                        <Step order={2}>
                            <Field name="email" validate={z.string()}>
                                <input data-testid="email-input" />
                            </Field>
                        </Step>
                        <Step order={3}>
                            <Field virtual>
                                <div>Review</div>
                            </Field>
                        </Step>
                        <div data-testid="is-step-1">
                            {String(form.isStep(1))}
                        </div>
                        <div data-testid="is-step-2">
                            {String(form.isStep(2))}
                        </div>
                    </Form>
                );
            }

            render(<TestForm />);

            await waitFor(() => {
                expect(screen.getByTestId('is-step-1').textContent).toBe('true');
                expect(screen.getByTestId('is-step-2').textContent).toBe('false');
            });
        });
    });

    describe('forms without Steps', () => {
        it('should work as a single-step form without Step components', () => {
            function TestForm() {
                const form = useForm({
                    initialValues: { name: '', email: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field name="name" validate={z.string()}>
                            <input data-testid="name-input" />
                        </Field>
                        <Field name="email" validate={z.string()}>
                            <input data-testid="email-input" />
                        </Field>
                        <div data-testid="step">{String(form.step)}</div>
                        <div data-testid="is-next">{String(form.isNext)}</div>
                        <div data-testid="is-previous">{String(form.isPrevious)}</div>
                    </Form>
                );
            }

            render(<TestForm />);
            expect(screen.getByTestId('step').textContent).toBe('null');
            expect(screen.getByTestId('is-next').textContent).toBe('false');
            expect(screen.getByTestId('is-previous').textContent).toBe('false');
        });
    });

    describe('isEmpty property', () => {
        it('should return true when no fields are registered', () => {
            function TestForm() {
                const form = useForm({
                    initialValues: {},
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <div data-testid="is-empty">{String(form.isEmpty)}</div>
                    </Form>
                );
            }

            render(<TestForm />);
            expect(screen.getByTestId('is-empty').textContent).toBe('true');
        });

        it('should return false when fields are registered', () => {
            function TestForm() {
                const form = useForm({
                    initialValues: { name: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field name="name" validate={z.string()}>
                            <input data-testid="name-input" />
                        </Field>
                        <div data-testid="is-empty">{String(form.isEmpty)}</div>
                    </Form>
                );
            }

            render(<TestForm />);
            expect(screen.getByTestId('is-empty').textContent).toBe('false');
        });

        it('should update when all fields are conditionally hidden', async () => {
            function TestForm() {
                const [showFields, setShowFields] = React.useState(true);
                const form = useForm({
                    initialValues: { name: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        {showFields && (
                            <Field name="name" validate={z.string()}>
                                <input data-testid="name-input" />
                            </Field>
                        )}
                        <button
                            data-testid="toggle-button"
                            onClick={() => setShowFields(false)}
                        >
                            Hide Fields
                        </button>
                        <div data-testid="is-empty">{String(form.isEmpty)}</div>
                    </Form>
                );
            }

            const { getByTestId } = render(<TestForm />);

            expect(getByTestId('is-empty').textContent).toBe('false');

            getByTestId('toggle-button').click();

            await waitFor(() => {
                expect(getByTestId('is-empty').textContent).toBe('true');
            });
        });
    });
});
