import { useContext, useMemo, useState, type ReactElement } from 'react';
import { FormikContext, useFormikContext, type FormikValues } from 'formik';
import type {
    Field,
    Fields,
    SchematikProps,
    Step,
    UseSchematikConfig,
    UseSchematikProps,
    ValidationSchemaField,
} from './types.ts';
import { useController, renderFields, renderInputs, FieldsContext } from './utils.tsx';

/**
 * Renders the form fields based on the current context.
 * @returns {ReactElement} The rendered form fields.
 * @throws {Error} If used outside of a Schematik provider.
 * @example
 * <Schematik {...props}>
 *   <Fields />
 * </Schematik>
 */
export function Fields<Values extends FormikValues>(): ReactElement {
    const fields = useContext(FieldsContext);
    const formik = useFormikContext<Values>();

    if (!fields) throw new Error('Fields must be used within a Schematik provider');

    return <>{renderInputs<Values>(fields, formik)}</>;
}

/**
 * A helper function to define a field.
 * @param {ValidationSchemaField<T>} field - The field to define.
 * @returns {Field} The defined field.
 * @example
 * const name = field({
 *   label: 'Name',
 *   name: 'name',
 *   type: 'text',
 * });
 */
// eslint-disable-next-line react-refresh/only-export-components
export function field<T>(field: ValidationSchemaField<T>): Field {
    return field as Field;
}

/**
 * A hook to manage the schematic form state.
 * @param {UseSchematikProps} props - The properties for the hook.
 * @returns {UseSchematikConfig} The schematic form configuration.
 * @example
 * const schematikConfig = useSchematik({
 *   fields,
 *   steps,
 *   initialStep: steps[0],
 * });
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useSchematik({ fields, initialStep, steps = [] }: UseSchematikProps): UseSchematikConfig {
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

/**
 * The main Schematik component.
 * @param {SchematikProps<Values>} props - The properties for the component.
 * @returns {ReactElement} The rendered Schematik component.
 * @example
 * <Schematik {...props}>
 *  <Fields />
 * </Schematik>
 */
export function Schematik<Values extends FormikValues>(props: SchematikProps<Values>): ReactElement {
    const controller = useController(props);

    const visibleFields = renderFields(
        controller.state.validationSchema,
        controller.state.step,
        props.schematikConfig?.steps ?? [],
    );

    return (
        <FormikContext.Provider value={controller.state.form}>
            <FieldsContext.Provider value={visibleFields}>
                {typeof props.children === 'function' ? props.children(controller.state.form) : props.children}
            </FieldsContext.Provider>
        </FormikContext.Provider>
    );
}
