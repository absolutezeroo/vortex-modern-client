<script>
    // `/settings/email` — `settings/email-change/…`: the unverified-address warning in a
    // `habbo-message-container`, then the change form — the current password, then a BOXED
    // "Nouvel Email" carrying habbo.com's own help line.
    //
    // Nothing here posts: the web API has no address-change route and no verification-resend route,
    // so both buttons are disabled rather than pretending.
    import SettingsShell from './SettingsShell.svelte';
    import MessageBox from '../../components/MessageBox.svelte';
    import Fieldset from '../../components/Fieldset.svelte';
    import PasswordField from '../../components/PasswordField.svelte';
    import Field from '../../components/Field.svelte';
    import Button from '../../components/Button.svelte';
    import {t} from '../../lib/i18n.js';

    let current = $state('');
    let email = $state('');
</script>

<SettingsShell>
    <MessageBox type="exclamation">
        <h3 class="mt-0">Tu n'as pas vérifié ton adresse email!</h3>
        <p>{t('ACTIVATION_RESEND_TEXT', {email: ''})}</p>
        <Button disabled className="mt-3">Envoyer un email de vérification</Button>
    </MessageBox>

    <h1>{t('EMAIL_CHANGE_TITLE')}</h1>

    <Fieldset>
        <PasswordField name="email-password" label={t('CURRENT_PASSWORD_LABEL')} bind:value={current} />
    </Fieldset>

    <Fieldset box title="Nouvel Email" help={t('EMAIL_NEW_HELP')}>
        <Field name="email-new" type="email" bind:value={email} autocomplete="email" />
    </Fieldset>

    <Fieldset>
        <Button disabled>{t('EMAIL_CHANGE_TITLE')}</Button>
    </Fieldset>
</SettingsShell>
