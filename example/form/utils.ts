import * as z from 'zod';

export const enum Steps {
    Name = 'name',
    Address = 'address',
    Review = 'review',
}

export const config = {
    initialStep: Steps.Name,
    stepSequence: [Steps.Name, Steps.Address, Steps.Review],
    initialValues: { name: '', guest: false, age: '', telephone: '' },
    validateOnBlur: false,
    validateOnChange: false,
};

export const schema = z.object({
    name: z.preprocess(
        (value) => value ?? '',
        z
            .string()
            .min(1, 'Name is required')
            .max(100, 'Name must be less than 100 characters'),
    ),
    guest: z.boolean().optional(),
    age: z.preprocess(
        (value) => value ?? '',
        z
            .string()
            .min(2, 'Age must be at least 2 characters')
            .max(100, 'Age must be less than 100 characters'),
    ),
    telephone: z.preprocess(
        (value) => value ?? '',
        z
            .string()
            .min(1, 'Telephone is required')
            .max(15, 'Telephone must be less than 15 characters'),
    ),
});
