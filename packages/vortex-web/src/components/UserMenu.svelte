<script>
    // habbo.com's `.user-menu`: a 190px block holding the name pill, the round avatar well that
    // overlaps the header, and a dropdown that opens BEHIND the header (the list's first item is
    // padded 70px down so it clears it) against a black 90% panel.
    import {link, location, push} from 'svelte-spa-router';
    import Sprite from './Sprite.svelte';
    import Avatar from './Avatar.svelte';
    import {me, signOut} from '../lib/session.js';
    import {t} from '../lib/i18n.js';

    let open = $state(false);

    // `user-menu.html`: profile, settings, help, logout — in that order, with those keys.
    const ITEMS = [
        {href: '/profile', icon: 'profile', label: t('NAVIGATION_PROFILE')},
        {href: '/settings', icon: 'settings', label: t('NAVIGATION_SETTINGS')},
        {href: '/help', icon: 'help', label: t('NAVIGATION_HELP')},
    ];

    async function handleSignOut()
    {
        open = false;
        await signOut();
        push('/');
    }
</script>

<svelte:window onclick={(event) =>
{
    if(open && !event.target.closest('[data-user-menu]'))
    {
        open = false;
    }
}} />

<div class="relative w-[190px]" data-user-menu>
    <!-- The list is a sibling of the toggle and sits under it: z-200 against the header's z-500. -->
    <div class="absolute top-0 left-0 z-[200] w-full overflow-hidden rounded-[10px] bg-black/90 transition-[max-height,opacity] duration-200 ease-out"
         style="max-height:{open ? '240px' : '0'};opacity:{open ? 1 : 0}">
        <ul class="pb-3">
            {#each ITEMS as item (item.href)}
                <li class="px-3 pt-[1px] first:pt-[70px]">
                    <a href={item.href} use:link onclick={() => (open = false)}
                       class="relative block py-1.5 pl-6 font-condensed leading-[22px] uppercase hover:border-b-0 {$location === item.href ? 'text-nav-link-active' : 'text-white hover:text-nav-link-hover'}">
                        <Sprite name={item.icon} className="absolute left-0 top-1/2 -translate-y-1/2" />
                        {item.label}
                    </a>
                </li>
            {/each}
            <li class="px-3 pt-[1px]">
                <button type="button" onclick={handleSignOut}
                        class="relative block w-full py-1.5 pl-6 text-left font-condensed leading-[22px] text-white uppercase hover:text-nav-link-hover">
                    <Sprite name="logout" className="absolute left-0 top-1/2 -translate-y-1/2" />
                    {t('NAVIGATION_LOGOUT')}
                </button>
            </li>
        </ul>
    </div>

    <div class="relative z-[201] flex h-[70px] items-center">
        <button type="button" onclick={() => (open = !open)}
                class="w-[145px] shrink-0 rounded-[3px] border-2 border-pill-line bg-pill py-[5px] pr-[39px] pl-3 font-condensed text-white uppercase shadow-pill xs:w-[171px]">
            <span class="relative block truncate pl-6 text-right leading-[22px] normal-case">
                <Sprite name="caret" className="absolute left-0 top-1/2 -translate-y-1/2 transition-transform duration-300 {open ? 'rotate-180' : ''}" />
                {$me?.name ?? 'Habbo'}
            </span>
        </button>

        <!-- The head OVERLAPS the pill — that is what the pill's 39px of right padding is reserving
             (`.user-menu__name__wrapper { padding: 5px 39px 5px 12px }`), and it is why the name is
             right-aligned inside it. Pulling the well back over that padding is the whole trick: sat
             beside the pill instead, the two read as two separate controls. -->
        <a href="/profile" use:link class="-ml-[33px] block shrink-0 hover:border-b-0">
            <Avatar user={$me?.name ?? ''} figure={$me?.figureString ?? ''} well={46} className="shadow-pill" />
        </a>
    </div>
</div>
