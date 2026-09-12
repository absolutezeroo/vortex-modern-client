<script lang="ts">
    // `/shop/prepaid` — `shop/prepaid/prepaid.html` + `shop/voucher-redeem/voucher-redeem.html`:
    // its own `.shop__header` title and the voucher form, nothing of the store's grid.
    //
    // Real since 2026-09-12: `POST /api/user/shop/voucher`, which goes to the very VoucherGrain the
    // game client's own redeem packet calls. The rules — expiry, one per account, the redemption cap,
    // and releasing the claim when the grant does not land — are the hotel's rules about vouchers,
    // and a web-shaped second copy of them would be a second set of bugs.
    //
    // Its refusals arrive as the grain's own codes (`expired`, `already_redeemed`, …) and lib/api.ts
    // turns them into French, so this page and the client's dialog say the same thing about the same
    // code.
    import ShopShell from './ShopShell.svelte';
    import Fieldset from '../../components/Fieldset.svelte';
    import Field from '../../components/Field.svelte';
    import Button from '../../components/Button.svelte';
    import FormError from '../../components/FormError.svelte';
    import MessageBox from '../../components/MessageBox.svelte';
    import * as api from '../../lib/api.js';
    import {signedIn} from '../../lib/session.js';
    import {t} from '../../lib/i18n.js';

    let code = $state('');
    let busy = $state(false);
    let error = $state('');
    let redeemed = $state(false);

    async function redeem(event: SubmitEvent)
    {
        event.preventDefault();

        if(busy || !code.trim())
        {
            return;
        }

        busy = true;
        error = '';
        redeemed = false;

        try
        {
            await api.redeemVoucher(code.trim());

            redeemed = true;
            code = '';
        }
        catch (failure)
        {
            error = (failure as Error).message;
        }
        finally
        {
            busy = false;
        }
    }
</script>

<ShopShell>
    <header>
        <h1 class="mt-0">{t('SHOP_PREPAID_TITLE')}</h1>
    </header>

    <div class="max-w-[520px]">
        {#if redeemed}
            <MessageBox type="check">
                <h2 class="mt-0">Code utilise</h2>
                <p>Regarde ton porte-monnaie : le credit est arrive.</p>
            </MessageBox>
        {/if}

        <form onsubmit={redeem}>
            <Fieldset box title={t('SHOP_REDEEM_TITLE')}>
                <Field name="voucher" label="Code" maxlength={64} bind:value={code} />

                {#if error}
                    <FormError inline>{error}</FormError>
                {/if}

                <Button type="submit" disabled={busy || !$signedIn} className="mt-3">
                    {t('SHOP_CLAIM_BUTTON')}
                </Button>
            </Fieldset>
        </form>

        {#if !$signedIn}
            <p class="px-3 text-sm">{t('SUBSCRIPTION-LOGINNEEDED')}</p>
        {/if}
    </div>
</ShopShell>
