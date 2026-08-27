import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';

// The CMS is a static SPA; everything dynamic is somebody else's service, and in dev each one is
// proxied so the browser sees a single origin. That matters for /api in particular: the emulator's
// web API authenticates with an HttpOnly session cookie (Vortex.WebApi/Session/WebApiSessionStore),
// and a cross-origin XHR would not carry it.
//
//   /api            -> Vortex.WebApi          (packages/vortex-client proxies the same host as /webapi)
//   /habbo-imaging  -> packages/vortex-imager (avatar heads, group badges)
//
// c_images (promo art, badge icons, room thumbnails) is NOT proxied: it is a plain asset host with
// no cookie to preserve, so lib/config.js points at it absolutely.
export default defineConfig({
    plugins: [tailwindcss(), svelte()],
    server: {
        port: 5174,
        strictPort: true,
        proxy: {
            '/api': {target: 'http://localhost:8080', changeOrigin: true},
            '/habbo-imaging': {target: 'http://localhost:8081', changeOrigin: true},
        },
    },
});
