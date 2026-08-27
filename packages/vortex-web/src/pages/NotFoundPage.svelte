<script>
    // `.not-found`. habbo.com puts a lost-looking Habbo on this page; the hotel's own c_images has
    // the reception art, so the 404 uses that rather than an illustration invented for it.
    import {link} from 'svelte-spa-router';
    import Button from '../components/Button.svelte';
    import {IMAGES} from '../lib/config.js';
</script>

<div class="mx-auto max-w-[720px] px-3 py-12 text-center">
    <img src="{IMAGES}/nux/H.png" alt="" class="mx-auto mb-6" />

    <h1>Cette page n'existe pas</h1>
    <p class="mt-3">Le couloir se termine ici. Reviens dans le hall.</p>

    <div class="mt-6">
        <Button href="#/me">Retour a l'accueil</Button>
    </div>

    <p class="mt-6 text-sm">
        <a href="/community" use:link class="hover:underline">Ou va lire les nouvelles</a>
    </p>
</div>
