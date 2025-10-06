import { useFormikContext } from 'formik';
import type { Schema } from '../../types.js';

export default function Age() {
    const form = useFormikContext<Schema>();

    return (
        <>
            <label>Age</label>
            <input type="text" {...form.getFieldProps('age')} />
            <div>{form.errors.age}</div>
        </>
    );
}
