import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { faker } from '@faker-js/faker';
import * as z from 'zod';
import * as React from 'react';
import { useForm, Form, Field } from '../index.js';

afterEach(() => {
    cleanup();
});

describe('Field Component', () => {
    describe('default prop behavior', () => {
        it('should set field value to default on mount', () => {
            const defaultName = faker.person.fullName();
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
                            default={defaultName}
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
            expect(input.value).toBe(defaultName);
        });

        it('should reset to default value on unmount', async () => {
            const defaultName = faker.person.fullName();
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
                                default={defaultName}
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

            expect(input.value).toBe(defaultName);

            input.value = changedName;
            input.dispatchEvent(new Event('change', { bubbles: true }));

            getByTestId('toggle-button').click();

            await waitFor(() => {
                expect(getByTestId('form-value').textContent).toBe(defaultName);
            });
        });

        it('should reset to initialValue when no default is provided', async () => {
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

        it('should handle numeric default values', () => {
            const defaultAge = faker.number.int({ min: 18, max: 100 });

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
                            default={defaultAge}
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
            expect(Number(input.value)).toBe(defaultAge);
        });

        it('should handle boolean default values', () => {
            const defaultChecked = faker.datatype.boolean();

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
                            default={defaultChecked}
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
            expect(formValue.textContent).toBe(String(defaultChecked));
        });

        it('should handle complex object default values', () => {
            const defaultAddress = {
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
                            default={defaultAddress}
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
            expect(display.textContent).toBe(JSON.stringify(defaultAddress));
        });
    });

    describe('step prop behavior', () => {
        it('should only render field when on the correct step', () => {
            const Steps = { Personal: 'personal', Delivery: 'delivery' };

            function TestForm() {
                const form = useForm({
                    initialStep: Steps.Personal,
                    stepSequence: [Steps.Personal, Steps.Delivery],
                    initialValues: { name: '', address: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field
                            name="name"
                            step={Steps.Personal}
                            validate={z.string()}
                        >
                            <input data-testid="name-input" />
                        </Field>
                        <Field
                            name="address"
                            step={Steps.Delivery}
                            validate={z.string()}
                        >
                            <input data-testid="address-input" />
                        </Field>
                    </Form>
                );
            }

            render(<TestForm />);
            expect(screen.queryByTestId('name-input')).toBeInTheDocument();
            expect(
                screen.queryByTestId('address-input'),
            ).not.toBeInTheDocument();
        });

        it('should render field without step prop regardless of current step', () => {
            const Steps = { Personal: 'personal' };

            function TestForm() {
                const form = useForm({
                    initialStep: Steps.Personal,
                    stepSequence: [Steps.Personal],
                    initialValues: { email: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field name="email" validate={z.string()}>
                            <input data-testid="email-input" />
                        </Field>
                    </Form>
                );
            }

            render(<TestForm />);
            expect(screen.queryByTestId('email-input')).toBeInTheDocument();
        });

        it('should show/hide fields when step changes', async () => {
            const Steps = { Personal: 'personal', Delivery: 'delivery' };

            function TestForm() {
                const form = useForm({
                    initialStep: Steps.Personal,
                    stepSequence: [Steps.Personal, Steps.Delivery],
                    initialValues: { name: '', address: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field
                            name="name"
                            step={Steps.Personal}
                            validate={z.string()}
                        >
                            <input data-testid="name-input" />
                        </Field>
                        <Field
                            name="address"
                            step={Steps.Delivery}
                            validate={z.string()}
                        >
                            <input data-testid="address-input" />
                        </Field>
                        <button
                            data-testid="next-button"
                            onClick={form.handleNext}
                        >
                            Next
                        </button>
                    </Form>
                );
            }

            const { getByTestId, queryByTestId } = render(<TestForm />);
            expect(queryByTestId('name-input')).toBeInTheDocument();
            expect(queryByTestId('address-input')).not.toBeInTheDocument();

            getByTestId('next-button').click();

            await waitFor(() => {
                expect(queryByTestId('name-input')).not.toBeInTheDocument();
                expect(queryByTestId('address-input')).toBeInTheDocument();
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
            const Steps = { Review: 'review' };

            function TestForm() {
                const form = useForm({
                    initialStep: Steps.Review,
                    stepSequence: [Steps.Review],
                    initialValues: {},
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field virtual step={Steps.Review}>
                            <div data-testid="review-content">Review</div>
                        </Field>
                    </Form>
                );
            }

            render(<TestForm />);
            expect(screen.queryByTestId('review-content')).toBeInTheDocument();
        });

        it('should respect step prop on virtual fields', () => {
            const Steps = { Personal: 'personal', Review: 'review' };

            function TestForm() {
                const form = useForm({
                    initialStep: Steps.Personal,
                    stepSequence: [Steps.Personal, Steps.Review],
                    initialValues: {},
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field virtual step={Steps.Review}>
                            <div data-testid="review-content">Review</div>
                        </Field>
                    </Form>
                );
            }

            render(<TestForm />);
            expect(
                screen.queryByTestId('review-content'),
            ).not.toBeInTheDocument();
        });
    });

    describe('multiple fields behavior', () => {
        it('should handle multiple fields independently', () => {
            const defaultName = faker.person.fullName();
            const defaultEmail = faker.internet.email();

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
                            default={defaultName}
                        >
                            <input
                                data-testid="name-input"
                                {...form.getFieldProps('name')}
                            />
                        </Field>
                        <Field
                            name="email"
                            validate={z.string()}
                            default={defaultEmail}
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

            expect(nameInput.value).toBe(defaultName);
            expect(emailInput.value).toBe(defaultEmail);
        });

        it('should unmount multiple fields independently', async () => {
            const defaultName = faker.person.fullName();
            const defaultEmail = faker.internet.email();

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
                                default={defaultName}
                            >
                                <input data-testid="name-input" />
                            </Field>
                        )}
                        {showEmail && (
                            <Field
                                name="email"
                                validate={z.string()}
                                default={defaultEmail}
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
                expect(getByTestId('name-value').textContent).toBe(defaultName);
            });

            expect(getByTestId('email-value').textContent).toBe(defaultEmail);

            getByTestId('toggle-email').click();

            await waitFor(() => {
                expect(getByTestId('email-value').textContent).toBe(
                    defaultEmail,
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
        it('should handle conditionally rendered fields with defaults', async () => {
            const defaultAddress = faker.location.streetAddress();

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
                                default={defaultAddress}
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
                    defaultAddress,
                );
            });
        });
    });

    describe('type safety', () => {
        it('should properly type default value based on validation schema', () => {
            function TestForm() {
                const form = useForm({
                    initialValues: { count: 0 },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field name="count" validate={z.number()} default={42}>
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
            const Steps = {
                Personal: 'personal',
                Address: 'address',
                Review: 'review',
            };

            function TestForm() {
                const form = useForm({
                    initialStep: Steps.Personal,
                    stepSequence: [Steps.Personal, Steps.Address, Steps.Review],
                    initialValues: { guest: false, name: '', address: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field
                            name="name"
                            step={Steps.Personal}
                            validate={z.string()}
                        >
                            <input data-testid="name-input" />
                        </Field>

                        <Field
                            name="guest"
                            step={Steps.Personal}
                            validate={z.boolean()}
                        >
                            <input
                                type="checkbox"
                                data-testid="guest-checkbox"
                                {...form.getFieldProps('guest')}
                            />
                        </Field>

                        {form.values.guest === false && (
                            <Field
                                name="address"
                                step={Steps.Address}
                                validate={z.string()}
                            >
                                <input data-testid="address-input" />
                            </Field>
                        )}

                        <Field virtual step={Steps.Review}>
                            <div data-testid="review-content">Review</div>
                        </Field>

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

            expect(getByTestId('current-step').textContent).toBe(
                Steps.Personal,
            );

            // When guest is set to true, the Address field unmounts
            // so handleNext should skip to Review (the next available step)
            getByTestId('toggle-and-next').click();

            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe(
                    Steps.Review,
                );
            });
        });

        it('should use latest step calculation when handleNext is deferred', async () => {
            const Steps = { Step1: 'step1', Step2: 'step2', Step3: 'step3' };

            function TestForm() {
                const form = useForm({
                    initialStep: Steps.Step1,
                    stepSequence: [Steps.Step1, Steps.Step2, Steps.Step3],
                    initialValues: { skipStep2: false },
                    onSubmit: () => {},
                });

                const handleClick = () => {
                    form.setFieldValue('skipStep2', true);
                    form.handleNext();
                };

                return (
                    <Form controller={form}>
                        <Field
                            name="skipStep2"
                            step={Steps.Step1}
                            validate={z.boolean()}
                        >
                            <input
                                type="checkbox"
                                data-testid="skip-checkbox"
                            />
                        </Field>

                        {!form.values.skipStep2 && (
                            <Field
                                name="field2"
                                step={Steps.Step2}
                                validate={z.string()}
                            >
                                <input data-testid="field2-input" />
                            </Field>
                        )}

                        <Field
                            name="field3"
                            step={Steps.Step3}
                            validate={z.string()}
                        >
                            <input data-testid="field3-input" />
                        </Field>

                        <button data-testid="next-button" onClick={handleClick}>
                            Next
                        </button>

                        <div data-testid="current-step">{form.step}</div>
                    </Form>
                );
            }

            const { getByTestId } = render(<TestForm />);

            expect(getByTestId('current-step').textContent).toBe(Steps.Step1);

            // When skipStep2 is set to true, field2 unmounts
            // so handleNext should skip to Step3 (the next available step)
            getByTestId('next-button').click();

            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe(
                    Steps.Step3,
                );
            });
        });

        it('should handle rapid handleNext calls correctly', async () => {
            const Steps = { Step1: 'step1', Step2: 'step2', Step3: 'step3' };

            function TestForm() {
                const form = useForm({
                    initialStep: Steps.Step1,
                    stepSequence: [Steps.Step1, Steps.Step2, Steps.Step3],
                    initialValues: { field1: '', field2: '', field3: '' },
                    onSubmit: () => {},
                });

                return (
                    <Form controller={form}>
                        <Field
                            name="field1"
                            step={Steps.Step1}
                            validate={z.string()}
                        >
                            <input data-testid="field1-input" />
                        </Field>

                        <Field
                            name="field2"
                            step={Steps.Step2}
                            validate={z.string()}
                        >
                            <input data-testid="field2-input" />
                        </Field>

                        <Field
                            name="field3"
                            step={Steps.Step3}
                            validate={z.string()}
                        >
                            <input data-testid="field3-input" />
                        </Field>

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

            expect(getByTestId('current-step').textContent).toBe(Steps.Step1);

            getByTestId('next-button').click();

            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe(
                    Steps.Step2,
                );
            });

            getByTestId('next-button').click();

            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe(
                    Steps.Step3,
                );
            });
        });

        it('should handle onSubmit that changes fields then calls handleNext', async () => {
            const Steps = { Form: 'form', Extra: 'extra', Review: 'review' };

            function TestForm() {
                const form = useForm({
                    initialStep: Steps.Form,
                    stepSequence: [Steps.Form, Steps.Extra, Steps.Review],
                    initialValues: { shouldShowExtra: false, name: 'test', extra: '' },
                    onSubmit: async () => {
                        form.setFieldValue('shouldShowExtra', true);
                        if (form.step !== Steps.Review) {
                            form.handleNext();
                        }
                    },
                });

                return (
                    <Form controller={form}>
                        <form onSubmit={form.handleSubmit}>
                            <Field
                                name="name"
                                step={Steps.Form}
                                validate={z.string()}
                            >
                                <input
                                    data-testid="name-input"
                                    {...form.getFieldProps('name')}
                                />
                            </Field>

                            {form.values.shouldShowExtra && (
                                <Field
                                    name="extra"
                                    step={Steps.Extra}
                                    validate={z.string().optional()}
                                >
                                    <input data-testid="extra-input" />
                                </Field>
                            )}

                            <Field virtual step={Steps.Review}>
                                <div data-testid="review-content">Review</div>
                            </Field>

                            <button type="submit" data-testid="submit-button">
                                Submit
                            </button>

                            <div data-testid="current-step">{form.step}</div>
                        </form>
                    </Form>
                );
            }

            const { getByTestId } = render(<TestForm />);

            expect(getByTestId('current-step').textContent).toBe(Steps.Form);

            getByTestId('submit-button').click();

            // After submit, shouldShowExtra is set to true, mounting the Extra field
            // handleNext should navigate to Extra step (the newly available step)
            await waitFor(() => {
                expect(getByTestId('current-step').textContent).toBe(
                    Steps.Extra,
                );
            });
        });
    });
});
