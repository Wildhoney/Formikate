import { useFormikContext } from 'formik';
import type { Schema } from '../../types.js';

export default function Review() {
    const form = useFormikContext<Schema>();

    return (
        <>
            Review
            <pre>{JSON.stringify(form.values, null, 2)}</pre>
        </>
    );
}
