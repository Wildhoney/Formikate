import type { FormikateProps, Fields, StepName } from '~/types.js';
import type { FormikValues } from 'formik';

export type StepsProps<Values extends FormikValues> = Pick<
    FormikateProps<Values>,
    'stepSequence'
> & {
    step: StepName | null;
    fields: Fields;
};
