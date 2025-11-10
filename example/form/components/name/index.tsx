/** @jsxImportSource @emotion/react */
import { useContext } from '../../../../src/context/index.js';
import type { Schema } from '../../types.js';
import * as styles from './styles.js';

export default function Name() {
    const form = useContext<Schema>();

    return (
        <div css={styles.container}>
            <label css={styles.label}>
                Name
                {form.isRequired('name') && (
                    <span css={styles.required}>*</span>
                )}
            </label>
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
