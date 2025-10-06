import type { FormikateProps, Step } from '~/types.js';
import type { FormikValues } from 'formik';

export type ResetProps<Values extends FormikValues> = Pick<
    FormikateProps<Values>,
    'stepSequence' | 'initialStep'
> & {
    setStep: React.Dispatch<React.SetStateAction<Step | null>>;
};
