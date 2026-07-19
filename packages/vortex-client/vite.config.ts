import {defineConfig} from 'vite';
import {resolve} from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@/assets': resolve(__dirname, 'src/assets'),
            '@': resolve(__dirname, 'src'),
            '@core': resolve(__dirname, '../vortex-engine/src/core'),
            '@habbo': resolve(__dirname, '../vortex-engine/src/habbo'),
            '@room': resolve(__dirname, '../vortex-engine/src/room'),
            '@iid': resolve(__dirname, '../vortex-engine/src/iid'),
            '@ui': resolve(__dirname, 'src'),
        },
    },
    server: {
        proxy: {
            '/webapi': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/webapi/, ''),
            },
        },
    },
    build: {
        target: 'ES2022',
        sourcemap: true,
    },
    esbuild: {
        tsconfigRaw: {
            compilerOptions: {
                experimentalDecorators: true,
            },
        },
    },
});
