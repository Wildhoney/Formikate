import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Form from './form';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Form />
    </StrictMode>,
);
