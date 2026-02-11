/** @jsxImportSource @emotion/react */
import { useFormikContext } from 'formik';
import type { Schema } from '../../types.js';
import * as styles from './styles.js';

export default function Guest() {
    const form = useFormikContext<Schema>();

    return (
        <div>
            <label css={styles.label}>
                <input
                    type="checkbox"
                    {...form.getFieldProps('guest')}
                    checked={form.values.guest}
                    css={styles.checkbox}
                />
                Continue as a guest?
            </label>
            {form.values.guest && (
                <div css={styles.info}>
                    Age is not required because you're checking out as a guest
                </div>
            )}
        </div>
    );
}
