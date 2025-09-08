# Gemini's Notes for the Schematik Repository

This document contains notes and observations about the Schematik repository to assist with future development.

## Project Overview

- **Framework:** React with Vite
- **Language:** TypeScript
- **Linting:** ESLint
- **Type Checking:** TypeScript

## Project Structure

- `src/`: Main source code.
    - `index.tsx`: Main entry point.
    - `types.ts`: Core type definitions for the application.
    - `utils.ts`: Utility functions and custom hooks.
- `example/`: Example usage of the Schematik library.
- `public/`: Static assets.
- `dist/`: Build output directory.

## Common Commands

The project uses `npm` for package management.

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
- **Generics:** The core components and hooks like `useController` and `SchematikProps` are generic and use `FormikValues` for type safety with Formik.

## Future Improvements / To-Do

- Add a test runner and write tests for the components and hooks.
- Fix the remaining linting error in `example/form/utils.tsx`.
