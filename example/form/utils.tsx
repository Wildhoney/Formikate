import * as z from "zod";

enum Screen {
  Details,
  OTP,
}


export function validationSchema(values) {
  return z.object({
    name: z.string().meta({
      screen: Screen.Details,
      render({ value, handleChange }) {
        return (
          <div>
            <label htmlFor="name">Name</label>
            <input name="name" value={value} onChange={handleChange} />
          </div>
        );
      },
    }),
    age: z
      .string()
      .optional()
      .meta({
        screen: Screen.Details,
        render({ value, handleChange }) {
          return (
            <div>
              <label htmlFor="age">Age</label>
              <input name="age" value={value} onChange={handleChange} />
            </div>
          );
        },
      }),
    telephone: z.string().meta({
      screen: Screen.OTP,
      render({ value, handleChange }) {
        return (
          <div>
            <label htmlFor="telephone">Telephone</label>
            <input name="telephone" value={value} onChange={handleChange} />
          </div>
        );
      },
    }),
  });
}
