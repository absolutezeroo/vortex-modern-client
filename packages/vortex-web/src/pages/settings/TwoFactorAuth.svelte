<script>
    // `/settings/2fa` — `settings/two-factor-auth/two-factor-auth-edit.html`: a heading, the
    // description, then a `habbo-message-container type="2fa-off"` carrying the two enrolment
    // buttons, each `min-width: 75%` and on its own row.
    //
    // Both are disabled: the web API accepts a code at sign-in (`pocket.auth.mfa_required`) but
    // exposes no route to enrol from the site.
    import SettingsShell from './SettingsShell.svelte';
    import MessageBox from '../../components/MessageBox.svelte';
    import Button from '../../components/Button.svelte';
    import {t} from '../../lib/i18n.js';
</script>

<SettingsShell>
    <h3 class="mt-0">{t('TWO_FACTOR_AUTHENTICATION_TITLE')}</h3>
    <p>{t('TWO_FACTOR_AUTHENTICATION_DESCRIPTION')}</p>

    <MessageBox type="2fa-off">
        <h3 class="mt-0">{t('TWO_FACTOR_AUTHENTICATION_OFF')}</h3>
        <p>{t('TWO_FACTOR_AUTHENTICATION_METHODS')}</p>

        <div class="mt-3 flex">
            <Button disabled className="min-w-[75%]">{t('TWO_FACTOR_AUTHENTICATION_AUTHENTICATOR_APP')}</Button>
        </div>
        <div class="mt-3 flex">
            <Button disabled className="min-w-[75%]">{t('TWO_FACTOR_AUTHENTICATION_EMAIL')}</Button>
        </div>
    </MessageBox>
</SettingsShell>
