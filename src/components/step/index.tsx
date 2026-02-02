import * as React from 'react';
import type { ReactElement } from 'react';

import type { StepProps } from '~/types.js';
import {
    StepNestingContext,
    CurrentStepContext,
    internalState,
    useContext,
} from '../../context/index.js';

export function Step({
    initial = false,
    order,
    children,
}: StepProps): ReactElement {
    const id = React.useId();
    const context = useContext();
    const state = React.useMemo(() => context[internalState], [context]);
    const isNested = React.useContext(StepNestingContext);
    const stateRef = React.useRef(state);

    if (isNested) {
        console.warn(
            `[Formikate] Step with order ${order} is nested inside another Step — this may cause unexpected behavior.`,
        );
    }

    const initialRef = React.useRef(initial);
    const isFirstRender = React.useRef(true);

    React.useLayoutEffect(() => {
        stateRef.current = state;
        stateRef.current.registerStep(
            { id: order, order, initial, fieldCount: 0 },
            id,
        );
        return () => stateRef.current.unregisterStep(id);
    }, [order, initial, id]);

    React.useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (initial && !initialRef.current) {
            stateRef.current.setStep(order);
        }
        initialRef.current = initial;
    }, [initial, order]);

    return (
        <StepNestingContext value={true}>
            <CurrentStepContext value={order}>{children}</CurrentStepContext>
        </StepNestingContext>
    );
}
