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
			}
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
