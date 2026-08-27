<script>
    // /hotel — the client, full-bleed, with habbo.com's yellow button pair pinned over the bottom
    // left of it (`.client__buttons`: two buttons that fuse into one pill, the inner corners
    // squared off).
    //
    // The ticket is fetched fresh on every mount and is SINGLE USE: the emulator burns it on the
    // handshake, so a remembered one would fail on the next visit. It is handed to the client on
    // the frame's query string, which is how habbo.com passes it too — FlashVars there, `?sso=`
    // here (packages/vortex-client/index.html reads it into VortexConfig.connection.ssoTicket).
    import {link, push} from 'svelte-spa-router';
    import Sprite from '../components/Sprite.svelte';
    import * as api from '../lib/api.js';
    import {selectedId} from '../lib/session.js';
    import {CLIENT_URL} from '../lib/config.js';

    let src = $state('');
    let error = $state('');
    let fullscreen = $state(false);
    let frame;

    $effect(() =>
    {
        let cancelled = false;

        (async () =>
        {
            try
            {
                const result = await api.ssoToken($selectedId || undefined);

                if(!cancelled)
                {
                    src = `${CLIENT_URL}/?sso=${encodeURIComponent(result.ssoToken)}`;
                }
            }
            catch(failure)
            {
                if(!cancelled)
                {
                    error = failure.message;
                }
            }
        })();

        return () => (cancelled = true);
    });

    function toggleFullscreen()
    {
        if(!document.fullscreenElement)
        {
            frame?.requestFullscreen?.();
            fullscreen = true;
        }
        else
        {
            document.exitFullscreen();
            fullscreen = false;
        }
    }
</script>

<div class="relative h-screen w-full bg-black">
    {#if error}
        <div class="flex h-full flex-col items-center justify-center gap-3 bg-page px-6 text-center">
            <h1>Impossible d'entrer</h1>
            <p class="text-ink">{error}</p>
            <p><a href="/" use:link class="font-condensed uppercase">Retour a l'accueil</a></p>
        </div>
    {:else if !src}
        <div class="flex h-full items-center justify-center bg-page">
            <p class="font-condensed uppercase text-ink">Ouverture de la porte...</p>
        </div>
    {:else}
        <iframe bind:this={frame} {src} title="Vortex" class="h-full w-full border-0" allow="autoplay; fullscreen"></iframe>

        <div class="absolute bottom-3 left-3 flex">
            <button type="button" onclick={() => push('/')}
                    class="mr-1 rounded-l-[5px] border-2 border-[#ffea00] bg-[#ffb900] px-3 py-1.5 text-xs font-condensed uppercase text-black shadow-btn hover:border-[#fffd70] hover:bg-[#ffd400] active:translate-y-[2px] active:border-[#ffce37] active:bg-[#f89400] active:shadow-btn-active">
                <Sprite name="close" className="mr-1.5 scale-75 align-middle" />
                Quitter
            </button>
            <button type="button" onclick={toggleFullscreen}
                    class="rounded-r-[5px] border-2 border-[#ffea00] bg-[#ffb900] px-3 py-1.5 text-xs font-condensed uppercase text-black shadow-btn hover:border-[#fffd70] hover:bg-[#ffd400] active:translate-y-[2px] active:border-[#ffce37] active:bg-[#f89400] active:shadow-btn-active">
                <Sprite name={fullscreen ? 'fullscreenBack' : 'fullscreen'} className="mr-1.5 align-middle" />
                {fullscreen ? 'Reduire' : 'Plein ecran'}
            </button>
        </div>
    {/if}
</div>
