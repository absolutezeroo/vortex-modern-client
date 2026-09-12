<script lang="ts">
    // `/shop/prepaid` — `shop/prepaid/prepaid.html`: its own `.shop__header` title, the CMS page
    // that explains where to buy a card, and `<habbo-voucher-redeem>` — the same component the store
    // page puts in its "Tu as un code?" aside, not a second copy of the form.
    //
    // Real since 2026-09-12: `POST /api/user/shop/voucher`, which goes to the very VoucherGrain the
    // game client's own redeem packet calls. Its rules — expiry, one per account, the redemption cap,
    // and releasing the claim when the grant does not land — are the hotel's rules about vouchers,
    // and a web-shaped second copy of them would be a second set of bugs.
    import ShopShell from './ShopShell.svelte';
    import Fieldset from '../../components/Fieldset.svelte';
    import VoucherRedeem from '../../components/VoucherRedeem.svelte';
    import {signedIn} from '../../lib/session.js';
    import {t} from '../../lib/i18n.js';
</script>

<ShopShell>
    <header class="mb-6">
        <h1 class="mt-0">{t('SHOP_PREPAID_TITLE')}</h1>
    </header>

    <div class="max-w-[520px]">
        <Fieldset box title={t('SHOP_REDEEM_TITLE')}>
            {#if $signedIn}
                <VoucherRedeem />
            {:else}
                <p class="m-0">{t('SUBSCRIPTION-LOGINNEEDED')}</p>
            {/if}
        </Fieldset>
    </div>
</ShopShell>
