<script lang="ts">
    // `/settings/2fa` — `settings/two-factor-auth/two-factor-auth-edit.html` plus the enrolment
    // modal's own template (`register-authenticator.html`): the description, a
    // `habbo-message-container` carrying the on/off state, and — when enrolling — the steps, the
    // secret and the code field.
    //
    // Real since 2026-09-12. `IAccountMfaService` has had the whole feature since the dashboard
    // needed it (begin / confirm / verify / disable, with `TotpSecret` on the account) and sign-in
    // has always answered `pocket.auth.mfa_required` against it — nothing had ever exposed the
    // enrolment half to the website, so this page could only show a grey button.
    //
    // The first component in this package on `lang="ts"`: it is the one that pays for it, since
    // every call here reads a generated shape.
    import SettingsShell from './SettingsShell.svelte';
    import MessageBox from '../../components/MessageBox.svelte';
    import Button from '../../components/Button.svelte';
    import Field from '../../components/Field.svelte';
    import FormError from '../../components/FormError.svelte';
    import * as api from '../../lib/api.js';
    import type {ITwoFactorEnrolment} from '../../lib/api.js';
    import {t} from '../../lib/i18n.js';

    let enabled = $state<boolean | null>(null);
    let enrolment = $state<ITwoFactorEnrolment | null>(null);
    let disabling = $state(false);
    let code = $state('');
    let error = $state('');
    let busy = $state(false);

    $effect(() =>
    {
        let cancelled = false;

        void api.getTwoFactor()
            .then((status) => !cancelled && (enabled = status.enabled))
            .catch(() => !cancelled && (enabled = null));

        return () => (cancelled = true);
    });

    function reset(): void
    {
        enrolment = null;
        disabling = false;
        code = '';
        error = '';
    }

    async function run(action: () => Promise<unknown>): Promise<boolean>
    {
        busy = true;
        error = '';

        try
        {
            await action();

            return true;
        }
        catch(failure)
        {
            error = (failure as Error)?.message ?? '';

            return false;
        }
        finally
        {
            busy = false;
        }
    }

    async function start(): Promise<void>
    {
        reset();

        await run(async () => (enrolment = await api.startTwoFactor()));
    }

    async function confirm(): Promise<void>
    {
        if(!enrolment) return;

        if(await run(() => api.enableTwoFactor(enrolment!.secret, code.trim())))
        {
            enabled = true;
            reset();
        }
    }

    async function remove(): Promise<void>
    {
        if(await run(() => api.disableTwoFactor(code.trim())))
        {
            enabled = false;
            reset();
        }
    }
</script>

<SettingsShell>
    <h3 class="mt-0">{t('TWO_FACTOR_AUTHENTICATION_TITLE')}</h3>
    <p>{t('TWO_FACTOR_AUTHENTICATION_DESCRIPTION')}</p>

    {#if enabled === null}
        <!-- The status has not answered yet, or the visitor is signed out. Nothing is claimed
             either way: a box saying "disabled" before the answer arrives is a lie half the time. -->
    {:else if enabled && !disabling}
        <!-- `two-factor-auth-edit.html` pairs `_ON` with `_ENABLED_DESCRIPTION`, and this had
             `_DISABLED_DESCRIPTION` under it — so the box headed "L'AUTHENTIFICATION À DEUX FACTEURS
             EST ACTIVÉE" went on to say it was disabled for this account. The button was
             `_EDIT_OR_ENABLE` ("MODIFIER OU ACTIVER") on a control whose only job is to turn it off;
             habbo.com's is `_DISABLE`. Two keys, and between them the box claimed the opposite of
             the state it was reporting. -->
        <MessageBox type="2fa-on">
            <h3 class="mt-0">{t('TWO_FACTOR_AUTHENTICATION_ON')}</h3>
            <p>{t('TWO_FACTOR_AUTHENTICATION_ENABLED_DESCRIPTION')}</p>

            <Button className="mt-3" onclick={() => (disabling = true)}>
                {t('TWO_FACTOR_AUTHENTICATION_DISABLE')}
            </Button>
        </MessageBox>
    {:else if disabling}
        <MessageBox type="2fa-on">
            <h3 class="mt-0">{t('TWO_FACTOR_AUTHENTICATION_DISABLE_TITLE')}</h3>
            <p>{t('TWO_FACTOR_AUTHENTICATION_DISABLE_DESCRIPTION')}</p>

            <Field label={t('TWO_FACTOR_AUTHENTICATION_ENTER_EX_AUTH_CODE')}
                   bind:value={code} autocomplete="one-time-code" maxlength={6} />

            {#if error}
                <FormError inline>{error}</FormError>
            {/if}

            <div class="mt-3 flex gap-3">
                <Button onclick={remove} disabled={busy || !code.trim()}>
                    {t('TWO_FACTOR_AUTHENTICATION_DISABLE')}
                </Button>
                <Button onclick={reset}>
                    {t('TWO_FACTOR_AUTHENTICATION_CANCEL_BUTTON')}
                </Button>
            </div>
        </MessageBox>
    {:else if enrolment}
        <MessageBox type="2fa-off">
            <h3 class="mt-0">{t('TWO_FACTOR_AUTHENTICATION_REGISTER')}</h3>
            <p>{t('TWO_FACTOR_AUTHENTICATION_APP_DESCRIPTION')}</p>

            <!-- habbo.com's STEP2 and STEP3 describe a second code sent by e-mail. This hotel's
                 enrolment is the authenticator alone — AccountMfaService stores one TOTP secret and
                 sends nothing — so quoting those two steps would be instructions for a message that
                 never arrives. -->
            <p class="mt-3">{t('TWO_FACTOR_AUTHENTICATION_APP_STEP1')}</p>
            <p>{t('TWO_FACTOR_AUTHENTICATION_APP_STEP4')}</p>

            <!-- habbo.com shows a QR its server renders. There is none here yet, so the secret is
                 shown for manual entry and the otpauth link is live: on a phone it opens the
                 authenticator directly, which is the same gesture as scanning. -->
            <p class="mt-3 font-mono text-lg tracking-widest break-all select-all">{enrolment.secret}</p>
            <p><a href={enrolment.uri}>{t('TWO_FACTOR_AUTHENTICATION_AUTHENTICATOR_APP')}</a></p>

            <Field label={t('TWO_FACTOR_AUTHENTICATION_ENTER_AUTH_CODE')}
                   bind:value={code} autocomplete="one-time-code" maxlength={6} />

            {#if error}
                <FormError inline>{error}</FormError>
            {/if}

            <div class="mt-3 flex gap-3">
                <Button onclick={confirm} disabled={busy || !code.trim()}>
                    {t('TWO_FACTOR_AUTHENTICATION_REGISTER_BUTTON')}
                </Button>
                <Button onclick={reset}>
                    {t('TWO_FACTOR_AUTHENTICATION_CANCEL_BUTTON')}
                </Button>
            </div>
        </MessageBox>
    {:else}
        <MessageBox type="2fa-off">
            <h3 class="mt-0">{t('TWO_FACTOR_AUTHENTICATION_OFF')}</h3>
            <p>{t('TWO_FACTOR_AUTHENTICATION_METHODS')}</p>

            {#if error}
                <FormError inline>{error}</FormError>
            {/if}

            <div class="mt-3 flex">
                <Button className="min-w-[75%]" onclick={start} disabled={busy}>
                    {t('TWO_FACTOR_AUTHENTICATION_AUTHENTICATOR_APP')}
                </Button>
            </div>
            <!-- Still disabled, and this one honestly: AccountMfaService is TOTP only — there is no
                 e-mail second factor to enrol into. -->
            <div class="mt-3 flex">
                <Button disabled className="min-w-[75%]">
                    {t('TWO_FACTOR_AUTHENTICATION_EMAIL')}
                </Button>
            </div>
        </MessageBox>
    {/if}
</SettingsShell>
