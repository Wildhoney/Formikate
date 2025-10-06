import type { FormikValues } from 'formik';
import * as React from 'react';

import type { ResetProps } from './types.js';

export function useReset<Values extends FormikValues>({
    initialStep,
    stepSequence,
    setStep,
}: ResetProps<Values>) {
    const ref = React.useRef<boolean>(false);
    const dependency = JSON.stringify(stepSequence);

    React.useLayoutEffect((): void => {
        if (ref.current) {
            const firstStep = stepSequence?.[0] ?? null;
            setStep(initialStep ?? firstStep);
            ref.current = true;
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dependency]);
}
