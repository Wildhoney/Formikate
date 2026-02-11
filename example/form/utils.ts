import * as z from 'zod';

export const config = {
    validateOnBlur: false,
    validateOnChange: false,
    carousel: {
        dots: false,
        infinite: false,
        swipe: false,
        draggable: false,
        speed: 400,
    },
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

export const fields = {
    name: { step: 'name' as const, validate: schema.shape.name, value: '' },
    guest: {
        step: 'name' as const,
        validate: schema.shape.guest,
        value: false,
    },
    age: { step: 'name' as const, validate: schema.shape.age, value: '' },
    telephone: {
        step: 'address' as const,
        validate: schema.shape.telephone,
        value: '',
    },
};
