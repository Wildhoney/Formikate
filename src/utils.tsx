import { useFormik, type FormikContextType, type FormikValues, getIn } from 'formik';
import {
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    Fragment,
    type ReactElement,
    createContext,
} from 'react';
import * as z from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import type { Field, FieldProps, Fields, FormikateProps, Step, UseFormikateConfig } from './types.ts';

export const FieldsContext = createContext<Fields | null>(null);

/**
 * A React hook that controllers the logic of a multi-step form powered by Formik.
 * It manages the form's validation schema based on the current step.
 *
 * @template Values - The type of form values.
 * @param {FormikateProps<Values>} props - The properties for the Formikate form, including initial values and formikate configuration.
 * @returns {{ state: { form: import("formik").FormikContextType<Values>; validationSchema: Fields; step: import("./types").Step | null | undefined; } }} An object containing the form state, validation schema, and current step.
 */
export function useController<Values extends FormikValues>(props: FormikateProps<Values>) {
    const step = props.validationSchema?.step;
    const predicate = usePredicate(props.validationSchema);

    const initialFields = useMemo(
        () => props.validationSchema?.getFields(props.initialValues) ?? [],
        [props.validationSchema, props.initialValues],
    );

    const [validationSchema, setValidationSchema] = useState<Fields>(initialFields.filter(predicate));

    const form = useFormik({
        ...props,
        validationSchema: intoZodSchema(validationSchema),
    });

    const fields = useMemo(
        () => props.validationSchema?.getFields(form.values) ?? [],
        [form.values, props.validationSchema],
    );

    useExpose(form, fields, props.validationSchema);
    useRestore(fields, form, props.initialValues);

    useLayoutEffect(
        (): void => setValidationSchema(fields.filter(predicate)),
        [fields, form.values, predicate, props.validationSchema, step],
    );

    return useMemo(() => ({ state: { form, validationSchema, step } }), [validationSchema, form, step]);
}

/**
 * A React hook that returns a predicate function to filter form fields
 * based on the current step in a multi-step form.
 *
 * @template Values - The type of form values.
 * @param {FormikateProps<Values>["validationSchema"]} validationSchema - The configuration for the multi-step form.
 * @returns {(field: Field) => boolean} A predicate function that returns true if the field should be active on the current step.
 */
function usePredicate<Values extends FormikValues>(validationSchema: FormikateProps<Values>['validationSchema']) {
    return useCallback(
        (field: Field) => {
            if (field.enabled === false) return false;

            const steps = validationSchema?.steps ?? [];
            if (steps.length === 0) return true;

            const currentStep = validationSchema?.step;
            if (currentStep == null) return field.step === undefined;

            const index = field.step != null ? steps.indexOf(field.step) : -1;
            if (index === -1) return false;

            return index <= steps.indexOf(currentStep);
        },
        [validationSchema?.steps, validationSchema?.step],
    );
}

/**
 * Converts an array of Formikate field definitions into a Zod schema
 * that can be used by Formik for validation.
 *
 * @param {Fields} fields - An array of field definitions.
 * @returns {z.ZodObject<any>} A Zod object schema.
 */
function intoZodSchema(fields: Fields) {
    const validationSchema = fields.reduce<Record<string, z.ZodTypeAny>>(
        (fields, field) => ({ ...fields, [field.name]: field.validate }),
        {},
    );

    return toFormikValidationSchema(z.object(validationSchema));
}

/**
 * Returns the earliest field with an error based on step and field order.
 * @param errors - The Formik errors object.
 * @param fields - The array of all fields.
 * @param steps - The array of all steps.
 * @returns The first field with an error, or undefined if none exists.
 */
function takeEarliest(errors: FormikValues, fields: Fields, steps: Step[] = []): Field | undefined {
    return Object.keys(errors)
        .map((name) => fields.find((field) => field.name === name))
        .filter((field): field is Field => field !== undefined)
        .sort((a, b) => {
            const stepIndexA = a.step ? steps.indexOf(a.step) : -1;
            const stepIndexB = b.step ? steps.indexOf(b.step) : -1;

            if (stepIndexA !== stepIndexB) {
                return stepIndexA - stepIndexB;
            }

            const arrayIndexA = fields.indexOf(a);
            const arrayIndexB = fields.indexOf(b);

            return arrayIndexA - arrayIndexB;
        })[0];
}

/**
 * A React hook that restores the value of a field when it becomes disabled.
 * @template Values - The type of form values.
 * @param {Fields} fields - The array of all fields.
 * @param {ReturnType<typeof useFormik<Values>>} form - The Formik bag.
 * @param {Values} initialValues - The initial values of the form.
 */
function useRestore<Values extends FormikValues>(
    fields: Fields,
    form: ReturnType<typeof useFormik<Values>>,
    initialValues: Values,
) {
    const previousFieldsRef = useRef<Fields>(fields);

    useLayoutEffect(() => {
        fields.forEach((field) => {
            const oldField = previousFieldsRef.current.find((oldField) => oldField.name === field.name);
            if (oldField && oldField.enabled !== false && field.enabled === false) {
                form.setFieldValue(field.name, getIn(initialValues, field.name));
            }
        });
        previousFieldsRef.current = fields;
    }, [fields, form, initialValues]);
}

/**
 * A React hook that navigates to the earliest field with an error on form submission.
 * @template Values - The type of form values.
 * @param {ReturnType<typeof useFormik<Values>>} form - The Formik bag.
 * @param {Fields} fields - The array of all fields.
 * @param {UseFormikateConfig | undefined} validationSchema - The configuration for the multi-step form.
 */
function useExpose<Values extends FormikValues>(
    form: ReturnType<typeof useFormik<Values>>,
    fields: Fields,
    validationSchema: UseFormikateConfig | undefined,
) {
    const [lastSubmitCount, setLastSubmitCount] = useState<number>(form.submitCount);

    useLayoutEffect(() => {
        if (form.submitCount > lastSubmitCount && !form.isValid) {
            const earliest = takeEarliest(form.errors, fields, validationSchema?.steps);
            if (earliest?.step != null) validationSchema?.handleSet(earliest.step);
            setLastSubmitCount(form.submitCount);
        }
    }, [lastSubmitCount, validationSchema, form.values, form.submitCount, form.isValid, form.errors, fields]);
}

/**
 * Filters the validation schema fields to return only those that should be visible
 * based on the current step.
 *
 * @param validationSchema The complete validation schema fields.
 * @param currentStep The current step of the form.
 * @param steps An array of all defined steps in the form.
 * @returns An array of fields that are visible for the current step.
 */
export function renderFields(validationSchema: Fields, currentStep: Step | null | undefined, steps: Step[]): Fields {
    return validationSchema.filter((field) => {
        if (steps.length === 0) return true;
        if (currentStep == null) return field.step === undefined;
        return field.step === currentStep;
    });
}

/**
 * Renders the provided fields as React elements, injecting formik props.
 *
 * @template Values The type of the Formik values.
 * @param fields An array of fields to render.
 * @param form The Formik bag, containing form state and helpers.
 * @returns An array of React elements representing the rendered fields.
 */
export function renderInputs<Values extends FormikValues>(
    fields: Fields,
    form: FormikContextType<Values>,
): ReactElement[] {
    return fields.map((field) => (
        <Fragment key={field.name}>
            {field.element({
                ...form,
                optional: field.validate.safeParse(undefined).success,
                value: getIn(form.values, field.name),
                error: getIn(form.errors, field.name),
            } as FieldProps<Values>)}
        </Fragment>
    ));
}
