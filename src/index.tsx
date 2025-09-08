import { Fragment, useMemo, useState, type ReactElement } from 'react';
import { FormikContext, getIn, type FormikValues } from 'formik';
import type {
    Fields,
    SchematikProps,
    Step,
    UseSchematikConfig,
    UseSchematikProps,
    ValidationSchemaField,
} from './types';
import { useController } from './utils';

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

    return (
        <FormikContext.Provider value={controller.state.form}>
            {controller.state.validationSchema
                .filter((field) => {
                    const step = controller.state.step;
                    const steps = props.schematikConfig?.steps ?? [];
                    if (steps.length === 0) {
                        return true;
                    }
                    if (step == null) {
                        return field.step === undefined;
                    }
                    return field.step === step;
                })
                .map((field) => (
                    <Fragment key={field.name}>
                        {field.element({
                            ...controller.state.form,
                            optional:
                                field.validate.safeParse(undefined).success,
                            value: getIn(
                                controller.state.form.values,
                                field.name,
                            ),
                            error: getIn(
                                controller.state.form.errors,
                                field.name,
                            ),
                        })}
                    </Fragment>
                ))}
            {typeof props.children === 'function'
                ? props.children(controller.state.form)
                : props.children}
        </FormikContext.Provider>
    );
}
