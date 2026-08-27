<script>
    // `security/login/login-modal.html`, which is four elements and nothing else:
    //
    //   <div class="login">
    //     <button class="modal__close">          the sprite X, absolute right 12 / top 11
    //     <h3 class="modal__title">              #0e3955 bar, 42px line, CENTRED, NOT uppercase
    //     <div class="modal__content">           max-width 280, margin 24px auto 110px
    //       <habbo-login-form>
    //
    // The colours are the site's own and none of them are the greys this port first used:
    //   backdrop      #0c3a65 at 90% — the PAGE navy, not black
    //   .modal-content #0b6395, 3px #2685bc border, 10px radius, shadow 0 1px 2px
    //   .modal__title  #0e3955, 8px radius, text-shadow 0 1px #000
    //
    // The dialog is the DEFAULT size — `.modal-dialog { margin: 30px auto; max-width: 500px }`. The
    // login modal never asks for `.modal-sm` (400px), and 400 is visibly too narrow for the social
    // block above the fields.
    import Sprite from './Sprite.svelte';
    import LoginForm from './LoginForm.svelte';
    import {t} from '../lib/i18n.js';

    let {onClose} = $props();
</script>

<svelte:window onkeydown={(event) => event.key === 'Escape' && onClose()} />

<div class="fixed inset-0 z-[1040] overflow-y-auto"
     onclick={(event) => event.target === event.currentTarget && onClose()}
     role="presentation">
    <!-- `.modal-backdrop`: the page navy at 90%, fixed, behind the dialog. -->
    <div class="fixed inset-0 bg-page opacity-90"></div>

    <div class="relative mx-auto my-[10vh] w-full max-w-[400px] px-3">
        <div class="relative rounded-[10px] border-[3px] border-card-line bg-card shadow-card">
            <button type="button" onclick={onClose} class="absolute top-[11px] right-3 block" aria-label={t('FORM_CANCEL_LABEL')}>
                <Sprite name="close" />
            </button>

            <h3 class="m-0 rounded-lg bg-panel-head text-center leading-[42px] normal-case [text-shadow:0_1px_#000]">
                {t('LOGIN')}
            </h3>

            <div class="mx-auto mt-6 mb-12 w-full max-w-[280px] px-3">
                <LoginForm modal onDone={onClose} />
            </div>
        </div>
    </div>
</div>
