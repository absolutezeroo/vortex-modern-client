import {defineConfig} from 'vite';
import {resolve} from 'path';
import babel from 'vite-plugin-babel';

export default defineConfig({
	plugins: [
		babel({
			babelConfig: {
				plugins: [
					['@babel/plugin-proposal-decorators', {legacy: true}],
					['@babel/plugin-transform-class-properties', {loose: true}],
				],
			},
			exclude: /node_modules/,
		}),
	],
	resolve: {
		alias: {
			'@/assets': resolve(__dirname, 'src/assets'),
			'@': resolve(__dirname, 'src'),
			'@core': resolve(__dirname, '../helium-engine/src/core'),
			'@habbo': resolve(__dirname, '../helium-engine/src/habbo'),
			'@room': resolve(__dirname, '../helium-engine/src/room'),
			'@iid': resolve(__dirname, '../helium-engine/src/iid'),
			'@ui': resolve(__dirname, 'src'),
		},
	},
	server: {
		proxy: {
			'/c_images': {
				target: 'http://vortex-assets.local',
				changeOrigin: true,
				secure: false,
			},
			'/dcr': {
				target: 'http://vortex-assets.local',
				changeOrigin: true,
				secure: false,
			},
			'/gamedata': {
				target: 'http://vortex-assets.local',
				changeOrigin: true,
				secure: false,
			},
			'/gordon': {
				target: 'http://vortex-assets.local',
				changeOrigin: true,
				secure: false,
			},
			'/habbo-imaging': {
				target: 'http://vortex-assets.local',
				changeOrigin: true,
				secure: false,
			},
			// Local emulator web API (WebApiLoginProvider). The emulator doesn't send
			// Access-Control-Allow-Origin, so a direct cross-origin fetch() from the
			// Vite dev origin gets blocked by CORS. Proxying through the dev server
			// keeps the browser request same-origin; see web.api.en/.s2 in
			// common_configuration_txt.txt, which point at this prefix in dev.
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
