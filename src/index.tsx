import { Fragment, useMemo, useState, type ReactElement } from 'react';
import { FormikContext, getIn, type FormikValues } from 'formik';
import type {
    Fields,
    SchematikProps,
    Screen,
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
    initialScreen,
    screens = [],
}: UseSchematikProps): UseSchematikConfig {
    const [screen, setScreen] = useState<null | Screen>(initialScreen ?? null);

    return useMemo(() => {
        const current = screen !== null ? screens.indexOf(screen) : -1;
        const hasPrevious = current > 0;
        const hasNext = current !== -1 && current < screens.length - 1;

        const handlePrevious = () =>
            hasPrevious && setScreen(screens[current - 1]);
        const handleNext = () => hasNext && setScreen(screens[current + 1]);
        const handleSet = (screen: Screen) => setScreen(screen);

        return {
            screen,
            screens,
            hasPrevious,
            hasNext,
            getFields: fields,
            handlePrevious,
            handleNext,
            handleSet,
        };
    }, [fields, screen, screens]);
}

export function Schematik<Values extends FormikValues>(
    props: SchematikProps<Values>,
): ReactElement {
    const controller = useController(props);

    return (
        <FormikContext.Provider value={controller.state.form}>
            {controller.state.validationSchema
                .filter((field) => {
                    const screen = controller.state.screen;
                    const screens = props.schematikConfig?.screens ?? [];
                    if (screens.length === 0) {
                        return true;
                    }
                    if (screen == null) {
                        return field.step === undefined;
                    }
                    return field.step === screen;
                })
                .map((field) => (
                    <Fragment key={field.name}>
                        {field.element({
                            ...controller.state.form,
                            optional: field.validate.safeParse(undefined).success,
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
