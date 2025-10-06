import { useFormikContext } from 'formik';
import type { Schema } from '../../types.js';

export default function Name() {
    const form = useFormikContext<Schema>();

    return (
        <>
            <label>Name</label>
            <input type="text" {...form.getFieldProps('name')} />
            <div>{form.errors.name}</div>
        </>
    );
}
