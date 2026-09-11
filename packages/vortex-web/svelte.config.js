// `vitePreprocess` is what lets a component say `<script lang="ts">`: it hands the block to Vite's
// esbuild, which strips the types. Without it the Svelte compiler reads TypeScript syntax as broken
// JavaScript, and the error points at the type annotation rather than at the missing preprocessor.
//
// The site had no svelte.config at all and the plugin warned about it on every build.
import {vitePreprocess} from '@sveltejs/vite-plugin-svelte';

export default {
    preprocess: vitePreprocess(),
};
