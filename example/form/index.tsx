import { ReactElement, useCallback } from 'react';
import { Schematik, useSchematik } from '../../src';
import { fields } from './utils';
import { Screens } from './types';

export default function App(): ReactElement {
    const schematik = useSchematik({
        fields,
        screens: [Screens.Name, Screens.Address, Screens.Review],
        initialScreen: Screens.Name,
    });

    const handleSubmit = useCallback(
        (values) => {
            if (schematik.screen === Screens.Review) {
                return void console.log('Submitting form:', values);
            }

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
                    {schematik.screen === Screens.Review && (
                        <div>
                            <h2>Review your information</h2>
                            <pre>{JSON.stringify(props.values, null, 2)}</pre>
                        </div>
                    )}

                    <button
                        type="button"
                        disabled={!schematik.hasPrevious}
                        onClick={schematik.handlePrevious}
                    >
                        Back
                    </button>

                    <button type="submit">
                        {schematik.screen === Screens.Review
                            ? 'Submit'
                            : 'Next'}
                    </button>
                </form>
            )}
        </Schematik>
    );
}
