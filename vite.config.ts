import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), dts()],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.tsx'),
            name: 'Schematik',
            fileName: 'schematik',
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'formik'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    formik: 'Formik',
                },
            },
        },
    },
});
