import { useContext } from '../../../../src/context/index.js';
import { Steps } from '../../utils.js';

export default function Buttons() {
    const form = useContext();

    return (
        <section>
            <button
                type="button"
                disabled={!form.isPrevious}
                onClick={form.handlePrevious}
            >
                Back
            </button>

            <button type="submit" disabled={form.isSubmitting}>
                {form.step === Steps.Review ? 'Submit' : 'Next'}
            </button>

            <button type="button" onClick={() => form.handleGoto(Steps.Name)}>
                Reset
            </button>
        </section>
    );
}
