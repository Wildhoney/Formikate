import { useFormikContext } from 'formik';
import type { Schema } from '../../types.js';

export default function Telephone() {
    const form = useFormikContext<Schema>();

    return (
        <>
            <label>Telephone</label>
            <input type="text" {...form.getFieldProps('telephone')} />
            <div>{form.errors.telephone}</div>
        </>
    );
}
