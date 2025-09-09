import { ReactElement, useCallback } from 'react';
import { Form, Fields, useValidationSchema } from '../../src/index.tsx';
import { getValidationSchema, Steps } from './utils.tsx';

export default function App(): ReactElement {
    const validationSchema = useValidationSchema({
        validationSchema: getValidationSchema,
        steps: [Steps.Name, Steps.Address, Steps.Review],
        initialStep: Steps.Name,
    });

    const handleSubmit = useCallback(
        (values) => {
            if (validationSchema.step === Steps.Review) return void console.log(values);
            validationSchema.handleNext();
        },
        [validationSchema],
    );

    return (
        <Form
            initialValues={{ name: '', age: '', telephone: '' }}
            validationSchema={validationSchema}
            validateOnBlur={false}
            validateOnChange={false}
            onSubmit={handleSubmit}
        >
            {(props) => (
                <form onSubmit={props.handleSubmit}>
                    {validationSchema.step !== Steps.Review ? (
                        <Fields />
                    ) : (
                        <div>
                            <h2>Review your information</h2>
                            <pre>{JSON.stringify(props.values, null, 2)}</pre>
                        </div>
                    )}

                    <button
                        type="button"
                        disabled={!validationSchema.hasPrevious}
                        onClick={validationSchema.handlePrevious}
                    >
                        Back
                    </button>

                    <button type="submit">{validationSchema.step === Steps.Review ? 'Submit' : 'Next'}</button>
                </form>
            )}
        </Form>
    );
}
