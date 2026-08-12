import {defineConfig} from 'vite';
import {resolve} from 'path';
import {engineBundle} from './tools/vite-plugin-engine-bundle.mjs';

const ENGINE_SRC = resolve(__dirname, '../vortex-engine/src');

// In dev, `@core`/`@habbo`/`@room`/`@iid` are resolved by the engineBundle plugin instead of by
// `resolve.alias`, which serves the whole engine as ~3,970 separate HTTP modules. They cannot be
// declared here as well: vite:alias runs before user `enforce: 'pre'` plugins, so an alias would
// rewrite the specifier to the engine source before the plugin ever sees it.
const engineAliases = (enabled: boolean) => enabled
    ? {
        '@core': resolve(ENGINE_SRC, 'core'),
        '@habbo': resolve(ENGINE_SRC, 'habbo'),
        '@room': resolve(ENGINE_SRC, 'room'),
        '@iid': resolve(ENGINE_SRC, 'iid'),
    }
    : {};

export default defineConfig(({command}) => ({
    plugins: [
        // serve-only; `pnpm build` keeps the plain alias-driven resolution below
        engineBundle({
            clientRoot: __dirname,
            engineRoot: resolve(__dirname, '../vortex-engine'),
        }),
    ],
    resolve: {
        alias: {
            '@/assets': resolve(__dirname, 'src/assets'),
            '@': resolve(__dirname, 'src'),
            ...engineAliases(command === 'build'),
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
}));
