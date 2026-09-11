<script>
    // `.purse`: the five counters at the top of the sidebar, laid out two per row. The rule under
    // it is TWO lines — a dark one (--page) and a light one (--rule) a pixel below — which is what
    // gives the divider its engraved edge; a single border reads flat.
    //
    // Real since 2026-09-11: GET /api/user/purse, the wallet of the SELECTED avatar. It is refetched
    // when that selection changes — the five counters belong to one avatar, not to the account, and
    // switching avatars without refetching would show one player another's credits.
    import Sprite from './Sprite.svelte';
    import * as api from '../lib/api.js';
    import {selectedId, signedIn} from '../lib/session.js';

    let purse = $state(null);

    $effect(() =>
    {
        // Both are read so the effect re-runs on either: a sign-in, or a change of avatar.
        const who = $selectedId;
        const isIn = $signedIn;
        let cancelled = false;

        if(!isIn)
        {
            purse = null;

            return;
        }

        void api.getPurse()
            .then((answer) => !cancelled && (purse = answer))
            // Signed out mid-flight, or no avatar yet: the counters simply do not show.
            .catch(() => !cancelled && (purse = null));

        return () => (cancelled = true);
    });

    const ITEMS = $derived(purse === null ? [] : [
        {icon: 'credits', value: purse.credits, label: 'credits'},
        {icon: 'diamonds', value: purse.diamonds, label: 'diamants'},
        {icon: 'silver', value: purse.duckets, label: 'duckets'},
        {icon: 'habboClub', value: `${purse.habboClubDays} j`, label: 'Habbo Club'},
        {icon: 'buildersClub', value: purse.buildersFurniLimit, label: 'Builders Club'},
    ]);
</script>

{#if ITEMS.length}
    <div class="relative mb-3 border-b border-page after:absolute after:-bottom-[2px] after:left-0 after:h-px after:w-full after:overflow-hidden after:bg-rule after:content-['']">
        <div class="-mx-3 mb-3 flex flex-wrap">
            {#each ITEMS as item (item.icon)}
                <div class="w-1/2 px-3">
                    <p class="relative whitespace-nowrap py-1.5 pl-[26px] leading-[22px]" title={item.label}>
                        <Sprite name={item.icon} className="absolute left-0 top-1/2 -translate-y-1/2" />
                        {item.value}
                    </p>
                </div>
            {/each}
        </div>
    </div>
{/if}
