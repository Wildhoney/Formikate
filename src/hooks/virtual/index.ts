import * as React from 'react';
import type { Step } from '~/types.js';

/**
 * @description Props for the useVirtual hook.
 */
type Props = {
    /** Whether the field is a virtual field. */
    isVirtual: boolean;
    /** Whether the field is currently hidden. */
    isHidden: boolean;
    /** The step this field belongs to. */
    step: Step | null | undefined;
    /** Ref to the set of hidden step identifiers. */
    hidden: React.RefObject<Set<string> | null>;
};

/**
 * @name useVirtual
 * @description Manages the hidden state for virtual fields. When a virtual field
 * becomes visible, it delays removal from the hidden set to allow React StrictMode's
 * cleanup cycle to complete without triggering field deregistration.
 */
export function useVirtual({ isVirtual, isHidden, step, hidden }: Props) {
    /** Tracks whether the effect has been cancelled. */
    const cancelled = React.useRef<boolean>(false);

    React.useLayoutEffect(() => {
        if (!isVirtual || step == null) return;

        cancelled.current = false;
        if (!isHidden)
            queueMicrotask(() => {
                if (!cancelled.current) hidden.current?.delete(String(step));
            });

        return () => {
            cancelled.current = true;
        };
    }, [isVirtual, step, isHidden, hidden]);
}
