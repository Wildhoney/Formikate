import { useFormikContext } from 'formik';
import * as React from 'react';
import type { Field, StepName } from '~/types.js';

import { internalState, useContext } from '../../context/index.js';

export function Expose(): null {
    const ref = React.useRef<number>(0);
    const form = useFormikContext();
    const context = useContext();
    const state = React.useMemo(() => context[internalState], [context]);

    React.useEffect(() => {
        if (ref.current === form.submitCount) {
            return;
        }

        ref.current = form.submitCount;

        const errorIndices = Object.keys(form.errors).map((key: string) => {
            const field = state.fields.find((f: Field) => f.name === key);
            return state.stepSequence.findIndex(
                (step: StepName) => field?.step === step,
            );
        });

        const lowestIndex = Math.min(...errorIndices.filter((i) => i >= 0));

        if (lowestIndex < (state.currentStepIndex ?? 0)) {
            state.setStep(state.stepSequence[lowestIndex]);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.errors]);

    return null;
}
