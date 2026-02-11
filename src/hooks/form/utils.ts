/**
 * Internal configuration shared between `useForm` and `useFields`.
 * @property {symbol} validate - Unique symbol key used to attach the validation ref to the Formik instance.
 */
export const config = {
    validate: Symbol('formikate.validate'),
};
