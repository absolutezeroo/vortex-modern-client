<script lang="ts">
    // `shop/shop-footer/shop-footer.html`, which `shop.html` renders under EVERY shop tab and this
    // port had not rendered at all:
    //
    //   <footer class="shop-footer">
    //     <section class="main">  <h3 translate="SHOP_NOTICE_TITLE">   "Souviens-toi !"
    //                             <p  translate="SHOP_NOTICE_CONTENTS">
    //     <aside class="aside">   <h4 translate="SHOP_NOTICE_PROVIDER_TITLE">
    //                             <p  translate="SHOP_NOTICE_PROVIDER">
    //                             <a  translate="FOOTER_SUPPORT" href={FOOTER_SUPPORT_LINK}>
    //
    // It is not decoration. `SHOP_NOTICE_CONTENTS` is the consumer notice — ask whoever pays the
    // bill first, and digital content is delivered immediately so there is no right of withdrawal —
    // which is the kind of sentence a shop is expected to carry rather than to choose. Both it and
    // the provider block ship HTML of their own (<b>, <br>), so they are injected rather than
    // printed.
    //
    // `SHOP_NOTICE_PROVIDER` names Sulake, because that is what habbo.com's localisation says. A
    // hotel running this is not Sulake and should say who it is: the string is in
    // `src/lib/fr.json`, which is where every other label on the site is edited too.
    import {t} from '../../lib/i18n.js';
</script>

<footer class="mx-auto mb-6 max-w-[1200px] overflow-hidden rounded-[3px] bg-box px-3 py-6 xs:px-6 md:flex md:gap-6">
    <section class="min-w-0 flex-1">
        <h3 class="mt-0 normal-case">{t('SHOP_NOTICE_TITLE')}</h3>
        <p class="text-sm">{@html t('SHOP_NOTICE_CONTENTS')}</p>
    </section>

    <aside class="w-full shrink-0 md:w-[300px]">
        <h4 class="normal-case">{t('SHOP_NOTICE_PROVIDER_TITLE')}</h4>
        <p class="text-sm">{@html t('SHOP_NOTICE_PROVIDER')}</p>
        <p class="text-sm">
            <a href={t('FOOTER_SUPPORT_LINK')} target="_blank" rel="noopener noreferrer">{t('FOOTER_SUPPORT')}</a>
        </p>
    </aside>
</footer>
