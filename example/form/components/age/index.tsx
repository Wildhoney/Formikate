/** @jsxImportSource @emotion/react */
import { useFormikContext } from 'formik';
import type { Schema } from '../../types.js';
import * as styles from './styles.js';

export default function Age() {
    const form = useFormikContext<Schema>();

    return (
        <div css={styles.container}>
            <label css={styles.label}>Age</label>
            <input
                type="text"
                {...form.getFieldProps('age')}
                css={styles.input}
            />
            {form.errors.age && <div css={styles.error}>{form.errors.age}</div>}
        </div>
    );
}
