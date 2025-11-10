/** @jsxImportSource @emotion/react */
import { useContext } from '../../../../src/context/index.js';
import type { Schema } from '../../types.js';
import * as styles from './styles.js';

export default function Age() {
    const form = useContext<Schema>();

    return (
        <div css={styles.container}>
            <label css={styles.label}>
                Age
                {form.isRequired('age') && <span css={styles.required}>*</span>}
            </label>
            <input
                type="text"
                {...form.getFieldProps('age')}
                css={styles.input}
            />
            {form.errors.age && <div css={styles.error}>{form.errors.age}</div>}
        </div>
    );
}
