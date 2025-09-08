import { useMemo, useState, type ReactElement } from 'react';
import { FormikContext, type FormikValues } from 'formik';
import type {
    Fields,
    SchematikProps,
    Step,
    UseSchematikConfig,
    UseSchematikProps,
    ValidationSchemaField,
} from './types';
import { useController, renderFields, renderInputs } from './utils.tsx'; // Updated imports

export type { Fields } from './types';

// eslint-disable-next-line react-refresh/only-export-components
export function field<T>(field: ValidationSchemaField<T>): Fields[number] {
    return field as Fields[number];
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSchematik({
    fields,
    initialStep,
    steps = [],
}: UseSchematikProps): UseSchematikConfig {
    const [step, setStep] = useState<null | Step>(initialStep ?? null);

    return useMemo(() => {
        const current = step !== null ? steps.indexOf(step) : -1;
        const hasPrevious = current > 0;
        const hasNext = current !== -1 && current < steps.length - 1;

        const handlePrevious = () => hasPrevious && setStep(steps[current - 1]);
        const handleNext = () => hasNext && setStep(steps[current + 1]);
        const handleSet = (step: Step) => setStep(step);

        return {
            step,
            steps,
            hasPrevious,
            hasNext,
            getFields: fields,
            handlePrevious,
            handleNext,
            handleSet,
        };
    }, [fields, step, steps]);
}

export function Schematik<Values extends FormikValues>(
    props: SchematikProps<Values>,
): ReactElement {
    const controller = useController(props);

    const visibleFields = renderFields(
        controller.state.validationSchema,
        controller.state.step,
        props.schematikConfig?.steps ?? [],
    );

    return (
        <FormikContext.Provider value={controller.state.form}>
            {renderInputs(visibleFields, controller.state.form)}
            {typeof props.children === 'function'
                ? props.children(controller.state.form)
                : props.children}
        </FormikContext.Provider>
    );
}
