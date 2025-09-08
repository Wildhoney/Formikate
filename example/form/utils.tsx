import * as z from 'zod';
import { Screens } from './types';
import { field, Fields } from '../../src';

const schema= z.object({
    name: z.string().min(1).max(100),
    age: z.string().min(2).max(100),
    telephone: z.string().min(1).max(15),
})

export function fields(values: z.infer<typeof schema>): Fields {
    return [
        field({
            name: 'name',
            step: Screens.Name,
            validate: schema.shape.name,
            element({ value, error, handleChange }) {
                return (
                    <div>
                        <label htmlFor="name">Name</label>
                        <input
                            name="name"
                            value={value}
                            onChange={handleChange}
                        />
                        {error && <div>{error}</div>}
                    </div>
                );
            },
        }),
        field({
            name: 'age',
            step: Screens.Name,
            validate: schema.shape.age,
            element({ value, error, handleChange }) {
                return (
                    <div>
                        <label htmlFor="age">Age</label>
                        <input
                            name="age"
                            value={value}
                            onChange={handleChange}
                        />
                        {error && <div>{error}</div>}
                    </div>
                );
            },
        }),
        field({
            name: 'telephone',
            step: Screens.Address,
            validate: schema.shape.telephone,
            element({ value, error, handleChange }) {
                return (
                    <div>
                        <label htmlFor="telephone">Telephone</label>
                        <input
                            name="telephone"
                            value={value}
                            onChange={handleChange}
                        />
                        {error && <div>{error}</div>}
                    </div>
                );
            },
        }),
    ];
}
