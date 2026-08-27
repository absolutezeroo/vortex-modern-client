<script>
    // `common/footer/footer.html`, labels and all. Two layouts:
    //
    //  - below 767: everything centred, socials in a row above the links, Sulake mark centred.
    //  - from 767: the socials float LEFT beside the links (12px/6px padding), the text goes
    //    left-aligned with 87px of right padding, and the Sulake mark is pinned to the top right of
    //    that padding — which is what the 87px is reserving.
    //
    // The separator between the links is habbo.com's own U+2044 FRACTION SLASH, and it is dropped
    // after the last item. The link list itself is `FooterController.links`, each entry a translate
    // key whose `_LINK` twin holds the URL — several of those point INSIDE the site
    // (`FOOTER_SAFETY_LINK = /playing-habbo/safety`), which is why they route rather than open a tab.
    import {link} from 'svelte-spa-router';
    import Sprite from './Sprite.svelte';
    import {t} from '../lib/i18n.js';

    const SOCIALS = ['facebook', 'twitter', 'youtube', 'instagram', 'rss'];

    const LINKS = ['FOOTER_SAFETY', 'FOOTER_TERMS', 'FOOTER_PRIVACY', 'FOOTER_HABBO_WAY', 'FOOTER_PARENTS'];

    // Only the in-site targets are routed; the rest are habbo.fr help-centre URLs this hotel does
    // not have, so they resolve to the nearest local page rather than a dead external link.
    const LOCAL = {
        FOOTER_SAFETY: '/playing-habbo/safety',
        FOOTER_TERMS: '/terms',
        FOOTER_PRIVACY: '/privacy',
        FOOTER_HABBO_WAY: '/playing-habbo/habbo-way',
        FOOTER_PARENTS: '/help',
    };

    const year = new Date().getFullYear();
</script>

<footer class="w-full shrink-0 bg-topbar">
    <div class="mx-auto max-w-[1200px] px-3">
        <div class="relative py-6">
            <div class="py-3 text-center md:float-left md:pr-3 md:text-left">
                <p class="m-0 font-condensed uppercase text-footer-link">{t('FOLLOW_HABBO')}</p>
                {#each SOCIALS as social (social)}
                    <span class="inline-block p-3 md:px-1.5 md:py-3">
                        <a href="#/community" class="block hover:border-b-0"><Sprite name={social} label={social} /></a>
                    </span>
                {/each}
            </div>

            <div class="relative text-center md:pt-3 md:pr-[87px] md:pl-3 md:text-left">
                <p>
                    {#each LINKS as key, index (key)}
                        <span class="inline text-sm leading-[1.4] text-footer-link">
                            <a href={LOCAL[key]} use:link class="text-inherit">{t(key)}</a>
                            {#if index < LINKS.length - 1}
                                <span class="mx-3 inline-block">&#8260;</span>
                            {/if}
                        </span>
                    {/each}
                </p>

                <Sprite name="sulake" label="Sulake" className="mx-auto my-3 block md:absolute md:top-0 md:right-0 md:my-0" />

                <p class="text-xs text-footer-copy">{t('FOOTER_COPYRIGHT', {year})}</p>
            </div>
        </div>
    </div>
</footer>
