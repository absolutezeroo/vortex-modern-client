<script>
    // `settings/avatar-selection/avatar-create/avatar-create-modal.html` + `…/avatar-create-form.html`.
    // Avatar creation is a MODAL on habbo.com, not a form folded into the page:
    //
    //   <button class="modal__close">  <h3 class="modal__title">Créer un nouvel avatar</h3>
    //   <div class="modal__content"><habbo-avatar-create-form>
    //
    // and the form leads with the bag-head illustration (`.avatar-create-form::before`, 94x116,
    // `margin: 0 auto 24px`), then the label, the field, two paragraphs of help, and
    // "Annuler" beside a blue "Créer".
    //
    // A name is 3 to 15 characters against habbo.com's own pattern, checked for availability as you
    // type. There is no look picker: a new avatar gets the default look and the client's own editor
    // changes it afterwards.
    import Sprite from './Sprite.svelte';
    import Button from './Button.svelte';
    import Field from './Field.svelte';
    import * as api from '../lib/api.js';
    import {avatars, selectedId} from '../lib/session.js';
    import {t} from '../lib/i18n.js';

    let {onClose} = $props();

    const BAGHEAD = new URL('../assets/teaser_baghead.png', import.meta.url).href;
    const NAME_PATTERN = /^[a-zA-Z0-9_\-=?!@:.,$]+$/;
    const DEFAULT_FIGURE = 'hr-802-31.hd-180-2.ch-215-66.lg-270-82.sh-305-62';

    let name = $state('');
    let available = $state(null);
    let checking = $state(false);
    let busy = $state(false);
    let error = $state('');
    let timer;

    const valid = $derived(name.trim().length >= 3
        && name.trim().length <= 15
        && NAME_PATTERN.test(name.trim()));

    // Trailing 500ms, the debounce habbo.com puts on the field: one request per keystroke against a
    // rate-limited endpoint is how a visitor gets 429'd while typing.
    $effect(() =>
    {
        const candidate = name.trim();

        available = null;

        if(!valid)
        {
            return;
        }

        timer = setTimeout(async () =>
        {
            checking = true;

            try
            {
                const result = await api.checkName(candidate);

                available = result?.valid === true;
            }
            catch
            {
                available = null;
            }
            finally
            {
                checking = false;
            }
        }, 500);

        return () => clearTimeout(timer);
    });

    async function create(event)
    {
        event.preventDefault();

        if(busy || !valid)
        {
            return;
        }

        busy = true;
        error = '';

        try
        {
            // The create call answers with the refreshed list, so the store is fed from its response
            // rather than re-fetched.
            const list = await api.createAvatar(name.trim(), DEFAULT_FIGURE, 'M');

            if(Array.isArray(list))
            {
                avatars.set(list);

                const made = list.find((avatar) => avatar.name === name.trim());

                if(made)
                {
                    selectedId.set(made.uniqueId);
                }
            }

            onClose();
        }
        catch(failure)
        {
            error = failure.message;
        }
        finally
        {
            busy = false;
        }
    }
</script>

<svelte:window onkeydown={(event) => event.key === 'Escape' && onClose()} />

<div class="fixed inset-0 z-[1040] overflow-y-auto"
     onclick={(event) => event.target === event.currentTarget && onClose()}
     role="presentation">
    <div class="fixed inset-0 bg-page opacity-90"></div>

    <div class="relative mx-auto my-[10vh] w-full max-w-[500px] px-3">
        <div class="relative rounded-[10px] border-[3px] border-card-line bg-card shadow-card">
            <button type="button" onclick={onClose} class="absolute top-[11px] right-3 block" aria-label={t('FORM_CANCEL_LABEL')}>
                <Sprite name="close" />
            </button>

            <h3 class="m-0 rounded-lg bg-panel-head text-center leading-[42px] normal-case [text-shadow:0_1px_#000]">
                {t('AVATAR_CREATE_TITLE')}
            </h3>

            <form class="mx-auto mt-6 mb-12 w-full max-w-[280px] px-3" onsubmit={create}>
                <img src={BAGHEAD} alt="" class="mx-auto mb-6 block h-[116px] w-[94px]" />

                {#if error}
                    <p class="mb-3 rounded-[3px] bg-error px-3 py-3 text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]">{error}</p>
                {/if}

                <Field name="avatar-name" label={t('AVATAR_CREATE_LABEL')} bind:value={name} maxlength={15} />

                <div class="min-h-[22px] text-sm">
                    {#if name.trim() && !valid}
                        <span class="text-error">{t('ERROR_FIELD_NAME_FORMAT')}</span>
                    {:else if checking}
                        <span>...</span>
                    {:else if available === true}
                        <span class="text-play-line">{name}</span>
                    {:else if available === false}
                        <!-- habbo.com's own ng-message for this field is ERROR_FIELD_NAME_TAKEN. -->
                        <span class="text-error">{t('ERROR_FIELD_NAME_TAKEN')}</span>
                    {/if}
                </div>

                <!-- habbo.com's own help text, which carries its own <br><br>. -->
                <p class="mt-3 text-sm">{@html t('AVATAR_CREATE_HELP')}</p>

                <div class="mt-6 flex items-center justify-between">
                    <!-- `.form__cancel` is an <a> on habbo.com, so it picks up BOTH site-wide anchor
                         rules: `color: #fff` and `a:hover { border-bottom: 1px solid }`. A <button>
                         inherits the body's light blue and no underline, so it has to ask for both —
                         which is why this read blue where habbo's reads white. -->
                    <button type="button" onclick={onClose} class="text-white hover:border-b hover:border-solid">{t('FORM_CANCEL_LABEL')}</button>
                    <Button type="submit" disabled={busy || !valid || available === false}>
                        {busy ? '...' : t('FORM_BUTTON_CREATE')}
                    </Button>
                </div>
            </form>
        </div>
    </div>
</div>
