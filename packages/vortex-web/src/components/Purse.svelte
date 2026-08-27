<script>
    // `.purse`: the five counters at the top of the sidebar, laid out two per row. The rule under
    // it is TWO lines — a dark one (--page) and a light one (--rule) a pixel below — which is what
    // gives the divider its engraved edge; a single border reads flat.
    //
    // The values are mocked (lib/mock.js -> PURSE): the emulator's web API has no wallet route yet.
    // The moment one lands, this component is the only thing that changes.
    import Sprite from './Sprite.svelte';
    import {PURSE} from '../lib/mock.js';

    const ITEMS = [
        {icon: 'credits', value: PURSE.credits, label: 'credits'},
        {icon: 'diamonds', value: PURSE.diamonds, label: 'diamants'},
        {icon: 'silver', value: PURSE.duckets, label: 'duckets'},
        {icon: 'habboClub', value: `${PURSE.hcDays} j`, label: 'Habbo Club'},
        {icon: 'buildersClub', value: PURSE.buildersFurni, label: 'Builders Club'},
    ];
</script>

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
