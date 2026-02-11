/** @jsxImportSource @emotion/react */
import { useFormikContext } from 'formik';
import type { Schema } from '../../types.js';
import * as styles from './styles.js';

export default function Name() {
    const form = useFormikContext<Schema>();

    return (
        <div css={styles.container}>
            <label css={styles.label}>Name</label>
            <input
                type="text"
                {...form.getFieldProps('name')}
                css={styles.input}
            />
            {form.errors.name && (
                <div css={styles.error}>{form.errors.name}</div>
            )}
        </div>
    );
}
