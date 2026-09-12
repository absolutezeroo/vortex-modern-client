<script lang="ts">
    // `shop/voucher-redeem/voucher-redeem.html`. A component rather than markup on a page because
    // habbo.com renders it in TWO places: the store's "Tu as un code?" aside and the prepaid tab.
    //
    //   <fieldset class="form__fieldset form__fieldset--inline">
    //     <div class="form__field voucher-redeem__row">
    //       <div class="voucher-redeem__field"><input class="form__input voucher-redeem__input">
    //       <button class="form__submit form__submit--inline">   SHOP_REDEEM_BUTTON
    //   <small class="form__helper" translate="PREPAID_ORDER_INSTRUCTION">
    //
    // The field and the button sit on ONE row — `--inline` — which is what makes it read as a redeem
    // box rather than as a form. Its own validation is `ng-pattern="/^[a-z0-9]{8}$/i"` and
    // `required`, answering ERROR_FIELD_REQUIRED and ERROR_VOUCHER_CODE_PATTERN before anything is
    // posted; the server's refusals (expired, already redeemed) come back as codes lib/api.ts words.
    //
    // The captcha habbo.com wires into it is deliberately absent: this hotel configures no provider,
    // and the rate limit on POST /api/user/shop/voucher is what stops a code being guessed at.
    import Sprite from './Sprite.svelte';
    import FormError from './FormError.svelte';
    import * as api from '../lib/api.js';
    import {t} from '../lib/i18n.js';

    // habbo.com's own: eight alphanumerics, either case.
    const CODE = /^[a-z0-9]{8}$/i;

    let code = $state('');
    let busy = $state(false);
    let error = $state('');
    let redeemed = $state(false);
    let touched = $state(false);

    const invalid = $derived(touched && !CODE.test(code.trim()));

    async function redeem(event: SubmitEvent)
    {
        event.preventDefault();

        touched = true;

        if(busy || !CODE.test(code.trim()))
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
            touched = false;
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

<form onsubmit={redeem}>
    <div class="flex items-start gap-1.5">
        <div class="min-w-0 flex-1">
            <input bind:value={code} onblur={() => (touched = true)} maxlength="8" autocomplete="off"
                   placeholder={t('SHOP_REDEEM_PLACEHOLDER')}
                   class="w-full rounded-[5px] border-[3px] border-field-line bg-field px-3 py-[5px] text-base leading-[1.2] text-field-ink shadow-field placeholder:text-[#888] focus:border-field-line-focus focus:bg-white focus:outline-none" />
        </div>

        <button type="submit" disabled={busy}
                class="shrink-0 rounded-[5px] border-2 border-btn-line bg-btn px-6 py-1.5 text-center font-condensed text-base uppercase leading-[1.2] text-white shadow-btn hover:border-btn-line-hover hover:bg-btn-hover active:translate-y-[2px] active:border-btn-line-active active:bg-btn-active active:shadow-btn-active disabled:opacity-40">
            {t('SHOP_REDEEM_BUTTON')}
        </button>
    </div>

    {#if invalid}
        <FormError inline>{code.trim() ? t('ERROR_VOUCHER_CODE_PATTERN') : t('ERROR_FIELD_REQUIRED')}</FormError>
    {:else if error}
        <FormError inline>{error}</FormError>
    {/if}

    <!-- habbo.com's own after-redeem wording, and the reason it is this key rather than a
         confirmation sentence: its `VOUCHER_REDEEM_NOTIFICATION_AWARDED` ("Bravo! Tu viens
         d'obtenir") is completed by WHAT was granted, and this API answers an empty body. Rather
         than invent the missing half, the box asks habbo.com's next question — and the purse beside
         it on the store page is where the new balance shows. -->
    {#if redeemed}
        <p class="mt-3 flex items-center gap-1.5 text-white">
            <Sprite name="statusCheck" />
            {t('REDEEM_TEXT_HEADER')}
        </p>
    {/if}

    <!-- `.form__helper`, and habbo.com's own sentence carries its own <a href="/shop/prepaid">. -->
    <small class="mt-3 block text-sm">{@html t('PREPAID_ORDER_INSTRUCTION')}</small>
</form>
