import { useFormik, type FormikValues } from 'formik';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import * as z from 'zod';
import type { Field, Fields, SchematikProps, Screen } from './types';
import { toFormikValidationSchema } from 'zod-formik-adapter';

/**
 * A React hook that controllers the logic of a multi-step form powered by Formik.
 * It manages the form's validation schema based on the current step.
 *
 * @template Values - The type of form values.
 * @param {SchematikProps<Values>} props - The properties for the Schematik form, including initial values and schematik configuration.
 * @returns {{ state: { form: import("formik").FormikContextType<Values>; validationSchema: Fields; screen: import("./types").Screen | null | undefined; } }} An object containing the form state, validation schema, and current screen.
 */
export function useController<Values extends FormikValues>({
    schematikConfig,
    ...props
}: SchematikProps<Values>) {
    const screen = schematikConfig?.screen;
    const predicate = usePredicate(schematikConfig);

    const initialFields = useMemo(
        () => schematikConfig?.getFields(props.initialValues) ?? [],
        [schematikConfig, props.initialValues],
    );

    const [validationSchema, setValidationSchema] = useState<Fields>(
        initialFields.filter(predicate),
    );

    const form = useFormik({
        ...props,
        validationSchema: intoZodSchema(validationSchema),
    });

    const [lastSubmitCount, setLastSubmitCount] = useState<number>(
        form.submitCount,
    );

    const fields = useMemo(
        () => schematikConfig?.getFields(form.values) ?? [],
        [form.values, schematikConfig],
    );

    useLayoutEffect(
        (): void => setValidationSchema(fields.filter(predicate)),
        [fields, form.values, predicate, schematikConfig, screen],
    );

    useLayoutEffect(() => {
        if (form.submitCount > lastSubmitCount && !form.isValid) {
            const earliest = takeEarliest(
                form.errors,
                fields,
                schematikConfig?.screens,
            );
            if (earliest?.step != null)
                schematikConfig?.handleSet(earliest.step);
            setLastSubmitCount(form.submitCount);
        }
    }, [
        lastSubmitCount,
        schematikConfig,
        form.values,
        form.submitCount,
        form.isValid,
        form.errors,
        fields,
    ]);

    return useMemo(
        () => ({ state: { form, validationSchema, screen } }),
        [validationSchema, form, screen],
    );
}

/**
 * Returns the earliest field with an error based on screen and field order.
 * @param errors - The Formik errors object.
 * @param fields - The array of all fields.
 * @param screens - The array of all screens.
 * @returns The first field with an error, or undefined if none exists.
 */
function takeEarliest(
    errors: FormikValues,
    fields: Fields,
    screens: Screen[] = [],
): Field | undefined {
    return Object.keys(errors)
        .map((name) => fields.find((field) => field.name === name))
        .filter((field): field is Field => field !== undefined)
        .sort((a, b) => {
            const screenIndexA = a.step ? screens.indexOf(a.step) : -1;
            const screenIndexB = b.step ? screens.indexOf(b.step) : -1;

            if (screenIndexA !== screenIndexB) {
                return screenIndexA - screenIndexB;
            }

            const arrayIndexA = fields.indexOf(a);
            const arrayIndexB = fields.indexOf(b);

            return arrayIndexA - arrayIndexB;
        })[0];
}

/**
 * A React hook that returns a predicate function to filter form fields
 * based on the current screen in a multi-step form.
 *
 * @template Values - The type of form values.
 * @param {SchematikProps<Values>["schematikConfig"]} schematikConfig - The configuration for the multi-step form.
 * @returns {(field: Field) => boolean} A predicate function that returns true if the field should be active on the current screen.
 */
function usePredicate<Values extends FormikValues>(
    schematikConfig: SchematikProps<Values>['schematikConfig'],
) {
    return useCallback(
        (field: Field) => {
            if (field.enabled === false) {
                return false;
            }

            const screens = schematikConfig?.screens ?? [];
            if (screens.length === 0) {
                return true;
            }

            const currentScreen = schematikConfig?.screen;
            if (currentScreen == null) {
                return field.step === undefined;
            }

            const currentIndex = screens.indexOf(currentScreen);
            const fieldIndex =
                field.step != null ? screens.indexOf(field.step) : -1;

            if (fieldIndex === -1) {
                return false;
            }

            return fieldIndex <= currentIndex;
        },
        [schematikConfig?.screens, schematikConfig?.screen],
    );
}

/**
 * Converts an array of Schematik field definitions into a Zod schema
 * that can be used by Formik for validation.
 *
 * @param {Fields} fields - An array of field definitions.
 * @returns {z.ZodObject<any>} A Zod object schema.
 */
function intoZodSchema(fields: Fields) {
    const validationSchema = fields.reduce<Record<string, z.ZodTypeAny>>(
        (acc, field) => ({ ...acc, [field.name]: field.validate }),
        {},
    );

    return toFormikValidationSchema(z.object(validationSchema));
}
