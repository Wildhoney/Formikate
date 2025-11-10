/** @jsxImportSource @emotion/react */
import { useContext } from '../../../../src/context/index.js';
import type { Schema } from '../../types.js';
import * as styles from './styles.js';

export default function Guest() {
    const form = useContext<Schema>();

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
            {/* Example usage of isVisible to show a helpful message */}
            {form.values.guest && !form.isVisible('age') && (
                <div css={styles.info}>
                    Age is not required because you're checking out as a guest
                </div>
            )}
        </div>
    );
}
