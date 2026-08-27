import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';

// The CMS is a static SPA; everything dynamic is somebody else's service, and each one is proxied so
// the browser sees a single origin. That matters for /api in particular: the emulator's web API
// authenticates with an HttpOnly session cookie (Vortex.WebApi/Session/WebApiSessionStore), and a
// cross-origin XHR would not carry it.
//
//   /api            -> Vortex.WebApi          (packages/vortex-client proxies the same host as /webapi)
//   /habbo-imaging  -> packages/vortex-imager (avatar heads, group badges, appart renders)
//   /c_images       -> the asset host         (promo art, badge icons, appart shots)
//   /client         -> packages/vortex-client (what /hotel puts in its iframe)
//
// c_images is proxied for a reason that only shows up off this machine: addressed absolutely as
// `http://vortex-assets.local`, it is resolved by the VIEWER's browser, so every image 404s on a
// phone on the same network. Through the proxy the dev server resolves it and any device works.
//
// `host: true` binds 0.0.0.0 so that phone can reach the site at all. This is a dev server on a LAN,
// not a public listener — but it is a listener, so it stays out of `build`.
export default defineConfig({
    plugins: [tailwindcss(), svelte()],
    server: {
        host: true,
        port: 5174,
        strictPort: true,
        proxy: {
            '/api': {target: 'http://localhost:8080', changeOrigin: true},
            '/habbo-imaging': {target: 'http://localhost:8081', changeOrigin: true},
            '/c_images': {target: 'http://vortex-assets.local', changeOrigin: true},

            // `ws: true` is not optional here: the client's dev server pushes HMR over a websocket,
            // and a proxy that forwards only HTTP leaves it retrying a connection that never opens.
            '/client': {target: 'http://localhost:5173', changeOrigin: true, ws: true},
        },
    },
});
