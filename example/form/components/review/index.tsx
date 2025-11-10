/** @jsxImportSource @emotion/react */
import { useFormikContext } from 'formik';
import type { Schema } from '../../types.js';
import * as styles from './styles.js';

export default function Review() {
    const form = useFormikContext<Schema>();

    return (
        <div css={styles.container}>
            <div css={styles.content}>
                <div>
                    <strong>Name:</strong> {form.values.name}
                </div>

                <div>
                    <strong>Guest:</strong> {form.values.guest ? 'Yes' : 'No'}
                </div>

                {!form.values.guest && (
                    <>
                        <div>
                            <strong>Age:</strong> {form.values.age}
                        </div>
                        <div>
                            <strong>Telephone:</strong> {form.values.telephone}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
