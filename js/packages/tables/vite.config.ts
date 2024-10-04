import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

export default defineConfig({
    plugins: [
        react(),
        libInjectCss(),
        dts({
            rollupTypes: true,
            include: ['src'],
            outDir: './dist/types',
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'Forms',
            formats: ['es'],
            fileName: 'index',
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'react-dom/client', 'react-dom/server'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react-dom/client': 'ReactDOM',
                    'react-dom/server': 'ReactDOMServer',
                },
            },
        },
        cssCodeSplit: false,
    },
    css: {
        postcss: {
            plugins: [tailwindcss, autoprefixer],
        },
    },
});
