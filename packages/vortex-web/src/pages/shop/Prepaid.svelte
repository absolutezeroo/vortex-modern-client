<script>
    // `/shop/prepaid` — `shop/prepaid/prepaid.html` + `shop/voucher-redeem/voucher-redeem.html`:
    // its own `.shop__header` title and the voucher form, nothing of the store's grid.
    //
    // The form is inert: the web API has no voucher route, so the button is disabled rather than
    // posting nowhere.
    import ShopShell from './ShopShell.svelte';
    import Fieldset from '../../components/Fieldset.svelte';
    import Field from '../../components/Field.svelte';
    import Button from '../../components/Button.svelte';
    import {t} from '../../lib/i18n.js';

    let code = $state('');
</script>

<ShopShell>
    <header>
        <h1 class="mt-0">{t('SHOP_PREPAID_TITLE')}</h1>
    </header>

    <div class="max-w-[520px]">
        <Fieldset box title={t('SHOP_PREPAID_TITLE')}>
            <Field name="voucher" label="Code" bind:value={code} />
            <Button disabled className="mt-3">{t('FORM_BUTTON_SAVE')}</Button>
        </Fieldset>

        <p class="px-3 text-sm text-footer-copy">
            Les codes ne sont pas branchés : l'émulateur n'expose pas de route de bon d'achat.
        </p>
    </div>
</ShopShell>
