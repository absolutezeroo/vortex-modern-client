<script>
    // The site shell. habbo.com has TWO headers and picks between them per page
    // (`home.html`: `ng-if="HomeController.hasHeaderLarge()"`): the large one is the signed-out
    // front page — a register pitch over the hotel art — and the small one is every other page.
    //
    // The router is not mounted until the identity probe has answered. That is not a nicety: the
    // route guards in lib/routes.js read the session store synchronously, so mounting first would
    // bounce a signed-in visitor off a guarded page for as long as the probe was in flight.
    import {onMount} from 'svelte';
    import Router, {location, replace} from 'svelte-spa-router';
    import HeaderSmall from './components/HeaderSmall.svelte';
    import HeaderLarge from './components/HeaderLarge.svelte';
    import LoginModal from './components/LoginModal.svelte';
    import Navigation from './components/Navigation.svelte';
    import Footer from './components/Footer.svelte';
    import Client from './components/Client.svelte';
    import {routes} from './lib/routes.js';
    import {refresh, outage, signedIn} from './lib/session.js';

    let status = $state('loading');
    let loginOpen = $state(false);

    // /hotel is the client, full-bleed: habbo.com drops the site chrome around it and so does this.
    const bare = $derived($location === '/hotel');

    // The client is mounted HERE, once, and never by the router — `.client` is parked at
    // `left:-9999px` when hidden and its iframe outlives every navigation, which is why habbo.com's
    // hotel does not have to be relaunched after closing it. Mounting it inside the /hotel route
    // would destroy it on each exit. It is only created once the visitor has actually gone there.
    let clientOpened = $state(false);

    $effect(() =>
    {
        if(bare)
        {
            clientOpened = true;
        }
    });

    const large = $derived($location === '/' && !$signedIn);

    onMount(async () =>
    {
        await refresh();
        status = 'ready';
    });
</script>

{#if status === 'loading'}
    <div class="flex min-h-screen items-center justify-center bg-page">
        <p class="font-condensed uppercase text-ink">Chargement de l'hotel...</p>
    </div>
{:else}
    <!-- Outside every branch below, so navigating away cannot take it down with the page: closing
         the hotel routes back to `/`, the client goes off-screen, and its socket stays up. -->
    {#if clientOpened}
        <Client visible={bare} onClose={() => replace('/')} />
    {/if}

    {#if bare}
        <!-- On /hotel the site's chrome is not rendered at all, exactly as habbo.com's own hotel
             state has nothing but the client. It is not merely covered: `.client` is
             `position: absolute`, so it is anchored to the DOCUMENT, not the viewport — leave a
             header, a navigation and a footer in the page and the document grows past one screen,
             the page scrolls, and the site reappears from under an overlay that stayed at the top.
             The client itself is rendered ABOVE this branch, so hiding the chrome never unmounts it. -->
        <Router {routes} on:conditionsFailed={() => replace('/')} />
    {:else}
    {#if $outage}
        <!-- The game server is unreachable. Everything that does not need it still works, so this
             is a strip and not a wall. -->
        <p class="bg-error px-3 py-1.5 text-center text-sm text-white">
            {$outage} — la connexion et l'entree dans l'hotel sont indisponibles.
        </p>
    {/if}

    {#if large}
        <HeaderLarge />
    {:else}
        <HeaderSmall onLogin={() => (loginOpen = true)} />
    {/if}

    <Navigation />

    <div class="w-full flex-[1_0_auto] overflow-hidden bg-gradient-to-br from-page-top to-page">
        <Router {routes} on:conditionsFailed={() => replace('/')} />
    </div>

    <Footer />

    {#if loginOpen}
        <LoginModal onClose={() => (loginOpen = false)} />
    {/if}
    {/if}
{/if}
