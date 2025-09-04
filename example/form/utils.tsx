import * as z from "zod";
import { Screens } from "./types";
import { field, ValidationSchema } from "../../src";

export function fields(values): ValidationSchema {
  return [
    field({
      name: "name",
      step: Screens.Name,
      validate: z.string(),
      element({ value, error, handleChange }) {
        return (
          <div>
            <label htmlFor="name">Name</label>
            <input name="name" value={value} onChange={handleChange} />
            {error && <div>{error}</div>}
          </div>
        );
      },
    }),
    field({
      name: "age",
      step: Screens.Name,
      validate: z.string().min(2).max(100),
      element({ value, error, handleChange }) {
        return (
          <div>
            <label htmlFor="age">Age</label>
            <input name="age" value={value} onChange={handleChange} />
            {error && <div>{error}</div>}
          </div>
        );
      },
    }),
    field({
      name: "telephone",
      step: Screens.Address,
      validate: z.string().min(10).max(15),
      element({ value, error, handleChange }) {
        return (
          <div>
            <label htmlFor="telephone">Telephone</label>
            <input name="telephone" value={value} onChange={handleChange} />
            {error && <div>{error}</div>}
          </div>
        );
      },
    }),
  ];
}
