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
    name: z.string().min(1).max(100),
    guest: z.boolean().optional(),
    age: z.string().min(2).max(100),
    telephone: z.string().min(1).max(15),
});
