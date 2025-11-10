/** @jsxImportSource @emotion/react */
import { useContext } from '../../../../src/context/index.js';
import type { Schema } from '../../types.js';
import * as styles from './styles.js';

export default function Telephone() {
    const form = useContext<Schema>();

    return (
        <div css={styles.container}>
            <label css={styles.label}>
                Telephone
                {form.isRequired('telephone') && (
                    <span css={styles.required}>*</span>
                )}
            </label>
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
