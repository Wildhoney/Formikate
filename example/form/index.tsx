import { ReactElement, useCallback } from 'react';
import { Fields, Schematik, useSchematik } from '../../src';
import { fields, Steps } from './utils';

export default function App(): ReactElement {
    const schematik = useSchematik({
        fields,
        steps: [Steps.Name, Steps.Address, Steps.Review],
        initialStep: Steps.Name,
    });

    const handleSubmit = useCallback(
        (values) => {
            if (schematik.step === Steps.Review) return void console.log('Submitting form:', values);
            schematik.handleNext();
        },
        [schematik],
    );

    return (
        <Schematik
            initialValues={{ name: '', age: '', telephone: '' }}
            schematikConfig={schematik}
            validateOnBlur={false}
            validateOnChange={false}
            onSubmit={handleSubmit}
        >
            {(props) => (
                <form onSubmit={props.handleSubmit}>
                    {schematik.step !== Steps.Review ? (
                        <Fields />
                    ) : (
                        <div>
                            <h2>Review your information</h2>
                            <pre>{JSON.stringify(props.values, null, 2)}</pre>
                        </div>
                    )}

                    <button type="button" disabled={!schematik.hasPrevious} onClick={schematik.handlePrevious}>
                        Back
                    </button>

                    <button type="submit">{schematik.step === Steps.Review ? 'Submit' : 'Next'}</button>
                </form>
            )}
        </Schematik>
    );
}
