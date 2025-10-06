import type { FormikateProps, Fields, Step } from '~/types.js';
import type { FormikValues } from 'formik';

export type StepsProps<Values extends FormikValues> = Pick<
    FormikateProps<Values>,
    'stepSequence'
> & {
    step: Step | null;
    fields: Fields;
};
