<script>
    // `/settings/security` — `settings/account-security/…`: the title, habbo.com's own description
    // (it carries its own <b>, hence the HTML injection), then a `habbo-message-container` holding
    // the lock's status and the button that would turn it on.
    //
    // Disabled: the security questions are an account-service feature the emulator's web API does
    // not expose. habbo.com's button is live, hence blue there and grey here.
    import SettingsShell from './SettingsShell.svelte';
    import MessageBox from '../../components/MessageBox.svelte';
    import Button from '../../components/Button.svelte';
    import {t} from '../../lib/i18n.js';
</script>

<SettingsShell>
    <h1 class="mt-0">{t('ACCOUNT_SECURITY_TITLE')}</h1>
    <p>{@html t('ACCOUNT_SECURITY_DESCRIPTION')}</p>

    <MessageBox type="exclamation">
        <h3 class="mt-0">{t('ACCOUNT_SECURITY_STATUS_DISABLED_TITLE')}</h3>
        <Button disabled className="mt-3">{t('ACCOUNT_SECURITY_ENABLE_BUTTON')}</Button>
    </MessageBox>
</SettingsShell>
