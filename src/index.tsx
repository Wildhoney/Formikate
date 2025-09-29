/* eslint-disable react-refresh/only-export-components */

import { useMemo, useState, type ReactElement } from 'react';
import type { FieldProps, Fields, FormikateProps, FormikateReturn, FormProps, Step } from './types';
import { Formik, type FormikValues } from 'formik';
import { internalState } from './utils';

export function useFormikate({ initialStep, steps }: FormikateProps): FormikateReturn {
    const [step, setStep] = useState<null | Step>(initialStep);
    const [field, setFields] = useState<Fields>([]);

    return useMemo(
        () => ({
            next() {},
            previous() {},
            goto(step) {
                setStep(step);
            },
            [internalState]: {
                validationSchema: undefined,
                setFields,
            },
        }),
        [],
    );
}

export function Form<Values extends FormikValues>(props: FormProps<Values>) {
    return <Formik {...props} validate={undefined} validationSchema={props.validationSchema ?? props.validate} />;
}

export function Field(props: FieldProps): ReactElement {
    return <>{props.children}</>;
}

// import * as React from 'react';
// import type { FilteredFields, Form, GetFilteredFields, Schema, State, Step } from './types.ts';
// import { Formik, useFormikContext } from 'formik';
// import { Context, intoZodSchema, useBootstrap, useContext, useSchemableFields, useVisibleFields } from './utils.tsx';

// export function getFilteredFields<S extends Schema>(ƒ: GetFilteredFields<S>) {
//     return ƒ;
// }

// export function useValidationSchema<S extends Schema>(getFilteredFields: GetFilteredFields<S>): State<S> {
//     const [step, setStep] = React.useState<null | Step>(null);
//     const [steps, setSteps] = React.useState<Step[]>([]);
//     const [validationSchema, setValidationSchema] = React.useState<null | S>(null);

//     return React.useMemo(
//         () => ({
//             step,
//             steps,
//             next() {},
//             previous() {},
//             goto(step: Step) {
//                 setStep(step);
//             },
//             isNext: true,
//             isPrevious: true,
//             validationSchema,
//             getFilteredFields,
//             setSteps,
//             setValidationSchema(schema: S) {
//                 setValidationSchema(schema);
//             },
//         }),
//         [getFilteredFields, step, steps, validationSchema],
//     );
// }

// export function Form<S extends Schema>({ validationSchema, ...props }: Form<S>): React.ReactNode {
//     return (
//         <Context.Provider value={validationSchema}>
//             <Formik {...props} />
//         </Context.Provider>
//     );
// }

// export function Fields<S extends Schema>() {
//     const form = useFormikContext<S>();
//     const context = useContext();

//     const fieldMappings = React.useMemo(() => context?.getFilteredFields<S>(form.values), [context, form.values]);

//     useBootstrap(fieldMappings);

//     const schemableFields = useSchemableFields(fieldMappings);
//     const visibleFields = useVisibleFields(schemableFields);

//     React.useLayoutEffect((): void => context.setValidationSchema(intoZodSchema(schemableFields)), []);

//     return visibleFields.map((field, index) => (
//         <React.Fragment key={`${field}.${index}`}>
//             {field.element({
//                 ...form.getFieldProps(field.name as string),
//                 ...form.getFieldMeta(field.name as string),
//                 ...form.getFieldHelpers(field.name as string),
//             })}
//         </React.Fragment>
//     ));
// }
