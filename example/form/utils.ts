import * as z from 'zod';

export const enum Steps {
    Name = 1,
    Address = 2,
    Review = 3,
}

export const getIndex: Record<number, number> = {
    [Steps.Name]: 0,
    [Steps.Address]: 1,
    [Steps.Review]: 2,
};

export const config = {
    initialValues: { name: '', guest: false, age: '', telephone: '' },
    validateOnBlur: false,
    validateOnChange: false,
};

export const carouselConfig = {
    dots: false,
    infinite: false,
    swipe: false,
    draggable: false,
    speed: 400,
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
