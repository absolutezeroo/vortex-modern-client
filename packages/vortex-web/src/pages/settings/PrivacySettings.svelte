<script>
    // `/settings/privacy` — `settings/privacy-settings/privacy-settings-form.html`. Six fieldsets,
    // and they ALTERNATE plain / boxed, which is what gives the page its striped look:
    //
    //   Confidentialité du Profil    plain   two radios
    //   Statut de connexion          BOX     two radios
    //   Préférences rejoindre        plain   one checkbox
    //   Demande d'amitié             BOX     one checkbox
    //   Notifications par email      plain   one checkbox, a subtitle, four checkboxes
    //   RGPD                         BOX     three radios
    //   <div class="form__footer">           the save button
    //
    // Every label is habbo.com's own key — "Personne" for `SETTINGS_ME_LABEL`, "cadeau" in lower
    // case for the gift notification, and so on.
    //
    // Nothing saves: the emulator's web API has no privacy route. The controls are live so the page
    // behaves, and the button is disabled rather than posting into the void.
    import SettingsShell from './SettingsShell.svelte';
    import Fieldset from '../../components/Fieldset.svelte';
    import Button from '../../components/Button.svelte';
    import {t} from '../../lib/i18n.js';

    let profileVisible = $state(false);
    let onlineStatusVisible = $state(true);
    let friendCanFollow = $state(true);
    let friendRequestEnabled = $state(true);
    let newsletter = $state(false);
    let notifyFriendRequest = $state(true);
    let notifyGift = $state(true);
    let notifyRoom = $state(true);
    let notifyGroup = $state(true);
    let gdpr = $state('');
</script>

<SettingsShell>
    <!-- The page's own title, not the tab bar's: the bar says "Paramètres" (SETTINGS_TITLE) and the
         page says "Paramètres de confidentialité". Reusing the bar's key printed it twice. -->
    <h1 class="mt-0">{t('PRIVACY_SETTINGS_TITLE')}</h1>

    <form>
        <Fieldset title={t('SETTINGS_PROFILE_VISIBILITY_TITLE')} help={t('SETTINGS_PROFILE_VISIBILITY_DESCRIPTION')}>
            <label class="block py-0.5 pl-1" for="profile-everyone">
                <input id="profile-everyone" type="radio" bind:group={profileVisible} value={true} class="mr-1.5 accent-btn" />
                <span>{t('SETTINGS_EVERYONE_LABEL')}</span>
            </label>
            <label class="block py-0.5 pl-1" for="profile-nobody">
                <input id="profile-nobody" type="radio" bind:group={profileVisible} value={false} class="mr-1.5 accent-btn" />
                <span>{t('SETTINGS_ME_LABEL')}</span>
            </label>
        </Fieldset>

        <Fieldset box title={t('SETTINGS_ONLINE_STATUS_TITLE')} help={t('SETTINGS_ONLINE_STATUS_DESCRIPTION')}>
            <label class="block py-0.5 pl-1" for="online-everyone">
                <input id="online-everyone" type="radio" bind:group={onlineStatusVisible} value={true} class="mr-1.5 accent-btn" />
                <span>{t('SETTINGS_EVERYONE_LABEL')}</span>
            </label>
            <label class="block py-0.5 pl-1" for="online-nobody">
                <input id="online-nobody" type="radio" bind:group={onlineStatusVisible} value={false} class="mr-1.5 accent-btn" />
                <span>{t('SETTINGS_ME_LABEL')}</span>
            </label>
        </Fieldset>

        <Fieldset title={t('SETTINGS_FRIENDS_CAN_FOLLOW_TITLE')}>
            <label class="block py-0.5 pl-1" for="friend-can-follow">
                <input id="friend-can-follow" type="checkbox" bind:checked={friendCanFollow} class="mr-1.5 accent-btn" />
                <span>{t('SETTINGS_ENABLE_FRIEND_CAN_FOLLOW_LABEL')}</span>
            </label>
        </Fieldset>

        <Fieldset box title={t('SETTINGS_FRIEND_REQUESTS_ENABLED_TITLE')}>
            <label class="block py-0.5 pl-1" for="friend-request-enable">
                <input id="friend-request-enable" type="checkbox" bind:checked={friendRequestEnabled} class="mr-1.5 accent-btn" />
                <span>{t('SETTINGS_ENABLE_FRIEND_REQUESTS_LABEL')}</span>
            </label>
        </Fieldset>

        <Fieldset title={t('SETTINGS_EMAIL_NOTIFICATIONS_TITLE')}>
            <label class="block py-0.5 pl-1" for="email-newsletter-enable">
                <input id="email-newsletter-enable" type="checkbox" bind:checked={newsletter} class="mr-1.5 accent-btn" />
                <span>{t('SETTINGS_ENABLE_NEWSLETTER_LABEL')}</span>
            </label>

            <p class="mt-3">{t('SETTINGS_EMAIL_NOTIFICATIONS_SUBTITLE')}</p>

            <label class="block py-0.5 pl-1" for="notify-friend">
                <input id="notify-friend" type="checkbox" bind:checked={notifyFriendRequest} class="mr-1.5 accent-btn" />
                <span>{t('SETTINGS_ENABLE_NOTIFICATION_FRIEND_REQUEST_LABEL')}</span>
            </label>
            <label class="block py-0.5 pl-1" for="notify-gift">
                <input id="notify-gift" type="checkbox" bind:checked={notifyGift} class="mr-1.5 accent-btn" />
                <span>{t('SETTINGS_ENABLE_NOTIFICATION_GIFT_LABEL')}</span>
            </label>
            <label class="block py-0.5 pl-1" for="notify-room">
                <input id="notify-room" type="checkbox" bind:checked={notifyRoom} class="mr-1.5 accent-btn" />
                <span>{t('SETTINGS_ENABLE_NOTIFICATION_ROOM_LABEL')}</span>
            </label>
            <label class="block py-0.5 pl-1" for="notify-group">
                <input id="notify-group" type="checkbox" bind:checked={notifyGroup} class="mr-1.5 accent-btn" />
                <span>{t('SETTINGS_ENABLE_NOTIFICATION_GROUP_LABEL')}</span>
            </label>
        </Fieldset>

        <Fieldset box title={t('SETTINGS_GDPR_TITLE')}>
            <label class="block py-0.5 pl-1" for="gdpr-access">
                <input id="gdpr-access" type="radio" bind:group={gdpr} value="access" class="mr-1.5 accent-btn" />
                <span>{t('SETTINGS_GDPR_ACCESS_REQUEST_LABEL')}</span>
            </label>
            <label class="block py-0.5 pl-1" for="gdpr-portability">
                <input id="gdpr-portability" type="radio" bind:group={gdpr} value="portability" class="mr-1.5 accent-btn" />
                <span>{t('SETTINGS_GDPR_PORTABILITY_REQUEST_LABEL')}</span>
            </label>
            <label class="block py-0.5 pl-1" for="gdpr-erasure">
                <input id="gdpr-erasure" type="radio" bind:group={gdpr} value="erasure" class="mr-1.5 accent-btn" />
                <span>{t('SETTINGS_GDPR_ERASURE_REQUEST_LABEL')}</span>
            </label>
        </Fieldset>

        <!-- `.form__footer`: centred, one button. -->
        <div class="mt-6 text-center">
            <Button type="submit" disabled>{t('FORM_BUTTON_SAVE')}</Button>
        </div>
    </form>
</SettingsShell>
