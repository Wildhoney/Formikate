# Gemini's Notes for the Formikate Repository

This document contains notes and observations about the Formikate repository to assist with future development.

## Project Overview

- **Framework:** React with Vite
- **Language:** TypeScript
- **Linting:** ESLint
- **Type Checking:** TypeScript
- **Package Manager:** npm and yarn

## Project Structure

- `src/`: Main source code.
    - `index.tsx`: Main entry point.
    - `types.ts`: Core type definitions for the application.
    - `utils.ts`: Utility functions and custom hooks.
- `example/`: Example usage of the Formikate library.
- `public/`: Static assets.
- `dist/`: Build output directory.

## Common Commands

The project uses `npm` for package management, but also has a `yarn.lock` file.

- `npm install`: Install dependencies.
- `npm run dev`: Start the development server.
- `npm run build`: Build the project for production (includes type checking).
- `npm run lint`: Lint the codebase.
- `npm run preview`: Preview the production build.

A `Makefile` is also available for convenience:

- `make install`
- `make dev`
- `make build`
- `make lint`
- `make lint-fix`
- `make typecheck`
- `make preview`
- `make clean`

## Key Conventions & Observations

- **Type Definitions:** Core types are centralized in `src/types.ts`.
- **Hooks:** Custom hooks are located in `src/utils.ts`.
- **Generics:** The core components and hooks like `useController` and `FormikateProps` are generic. The example in `example/form/utils.tsx` uses `zod` and `z.infer<typeof schema>` for strong-typing.
- **Styling:** The project uses `.prettierrc` for code formatting.
- **Linting:** The project uses `eslint.config.mjs`.

## Dependencies

- `zod`: for schema validation.
- `zod-formik-adapter`: for using zod schemas with formik.

## Future Improvements / To-Do

- Add a test runner and write tests for the components and hooks.
