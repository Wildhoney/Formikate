import { useFormikContext } from 'formik';
import * as React from 'react';
import type { Field } from '~/types.js';

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

        const errorStepOrders = Object.keys(form.errors)
            .map((key: string) => {
                const field = state.fields.find((f: Field) => f.name === key);
                return field?.stepOrder ?? null;
            })
            .filter((order): order is number => order !== null);

        if (errorStepOrders.length === 0) {
            return;
        }

        const lowestErrorOrder = Math.min(...errorStepOrders);
        const currentStepOrder = state.step as number | null;

        if (currentStepOrder !== null && lowestErrorOrder < currentStepOrder) {
            state.setStep(lowestErrorOrder);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.errors]);

    return null;
}
