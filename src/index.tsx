import { useContext, useMemo, useState, type ReactElement } from 'react';
import { FormikContext, useFormikContext, type FormikValues } from 'formik';
import type {
    Field,
    Fields,
    FormikateProps,
    Step,
    UseFormikateConfig,
    UseFormikateProps,
    ValidationSchemaField,
} from './types.ts';
import { useController, renderFields, renderInputs, FieldsContext } from './utils.tsx';

export type { Fields as ValidationSchema } from './types.ts';

/**
 * Renders the form fields based on the current context.
 * @returns {ReactElement} The rendered form fields.
 * @throws {Error} If used outside of a Formikate provider.
 * @example
 * <Form {...props}>
 *   <Fields />
 * </Form>
 */
export function Fields<Values extends FormikValues>(): ReactElement {
    const fields = useContext(FieldsContext);
    const formik = useFormikContext<Values>();

    if (!fields) throw new Error('Fields must be used within a Formikate provider');

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
 * @param {UseFormikateProps} props - The properties for the hook.
 * @returns {UseFormikateConfig} The schematic form configuration.
 * @example
 * const validationSchema = useValidationSchema({
 *   fields,
 *   steps,
 *   initialStep: steps[0],
 * });
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useValidationSchema({
    validationSchema,
    initialStep,
    steps = [],
}: UseFormikateProps): UseFormikateConfig {
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
            getFields: validationSchema,
            handlePrevious,
            handleNext,
            handleSet,
        };
    }, [validationSchema, step, steps]);
}

/**
 * The main Formikate component.
 * @param {FormikateProps<Values>} props - The properties for the component.
 * @returns {ReactElement} The rendered Form component.
 * @example
 * <Form {...props}>
 *  <Fields />
 * </Form>
 */
export function Form<Values extends FormikValues>(props: FormikateProps<Values>): ReactElement {
    const controller = useController(props);

    const visibleFields = renderFields(
        controller.state.validationSchema,
        controller.state.step,
        props.validationSchema?.steps ?? [],
    );

    return (
        <FormikContext.Provider value={controller.state.form}>
            <FieldsContext.Provider value={visibleFields}>
                {typeof props.children === 'function' ? props.children(controller.state.form) : props.children}
            </FieldsContext.Provider>
        </FormikContext.Provider>
    );
}
