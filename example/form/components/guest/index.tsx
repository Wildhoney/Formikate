import { useFormikContext } from 'formik';
import type { Schema } from '../../types.js';

export default function Guest() {
    const form = useFormikContext<Schema>();

    return (
        <label>
            <input
                type="checkbox"
                {...form.getFieldProps('guest')}
                checked={form.values.guest}
            />
            Continue as a guest?
        </label>
    );
}
