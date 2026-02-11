/** @jsxImportSource @emotion/react */
import { useFormikContext } from 'formik';
import type { Schema } from '../../types.js';
import * as styles from './styles.js';

export default function Telephone() {
    const form = useFormikContext<Schema>();

    return (
        <div css={styles.container}>
            <label css={styles.label}>Telephone</label>
            <input
                type="text"
                {...form.getFieldProps('telephone')}
                css={styles.input}
            />
            {form.errors.telephone && (
                <div css={styles.error}>{form.errors.telephone}</div>
            )}
        </div>
    );
}
