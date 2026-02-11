/** @jsxImportSource @emotion/react */
import { useFormikContext } from 'formik';
import { Position, type Status } from '../../../../src';
import * as styles from './styles.js';

type Props = {
    fields: Status;
};

export default function Buttons({ fields }: Props) {
    const form = useFormikContext();

    return (
        <section css={styles.container}>
            <button
                type="button"
                disabled={
                    !fields.navigate.exists(Position.Previous) ||
                    form.isSubmitting
                }
                onClick={() => fields.navigate.to(Position.Previous)}
                css={styles.back}
            >
                Back
            </button>

            <button
                type="submit"
                disabled={form.isSubmitting}
                css={styles.submit}
            >
                {fields.progress.last ? 'Submit' : 'Next'}
            </button>

            <button
                type="button"
                disabled={form.isSubmitting}
                onClick={() => fields.navigate.to(Position.First)}
                css={styles.reset}
            >
                Reset
            </button>
        </section>
    );
}
