/** @jsxImportSource @emotion/react */
import { useContext } from '../../../../src/context/index.js';
import { Steps } from '../../utils.js';
import * as styles from './styles.js';

export default function Buttons() {
    const form = useContext();

    return (
        <section css={styles.container}>
            <button
                type="button"
                disabled={!form.isPrevious || form.isSubmitting}
                onClick={form.handlePrevious}
                css={styles.back}
            >
                Back
            </button>

            <button
                type="submit"
                disabled={form.isSubmitting}
                css={styles.submit}
            >
                {form.step === Steps.Review ? 'Submit' : 'Next'}
            </button>

            <button
                type="button"
                disabled={form.isSubmitting}
                onClick={() => form.handleGoto(Steps.Name)}
                css={styles.reset}
            >
                Reset
            </button>
        </section>
    );
}
