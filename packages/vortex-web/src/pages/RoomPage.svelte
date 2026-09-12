<script>
    // `/room/:id` — `room/room.html` -> `room/room-open/room-open.html`:
    //
    //   .room__thumbnail          110x110, top left
    //   .room__content__title     the appart's name, in ITS OWN case
    //   .room__content__left      owner avatar, then <habbo-room-info>, then the enter button
    //   .room-info                a two-column list: "Description" / value, "Tags" / value
    //   .room__content__right     .room__details — "Détails de l'appart", Note + Nombre de personne
    //                             .room__actions — "Rapporter l'appart"
    //   <habbo-room-picture>      `room.imageUrl`, full width UNDER the section
    //
    // That last element is ABSENT here, and so is the picture over the thumbnail, on purpose.
    // habbo.com feeds both from `room.imageUrl` / `room.thumbnailUrl`: a PHOTO taken in-game with the
    // camera and set by the owner, not a render of the appart. This port had been filling them with
    // packages/vortex-imager's room render, which is a different thing that happens to look
    // plausible. Until the camera is ported there is nothing to put there, so the thumbnail is the
    // default plate the sprite sheet carries and the picture section does not exist — habbo.com's own
    // `habbo-remove-on-error` removes it too when there is no image.
    //
    // Real since 2026-09-11: GET /api/public/rooms/{id} — habbo.com's own route ("/public/rooms/:id").
    // It answers 404 for a room whose door is invisible as well as for one that does not exist, so
    // this page cannot be used to confirm a hidden appart exists.
    import {link} from 'svelte-spa-router';
    import Sprite from '../components/Sprite.svelte';
    import Avatar from '../components/Avatar.svelte';
    import * as api from '../lib/api.js';
    import {t} from '../lib/i18n.js';
    import {signedIn} from '../lib/session.js';

    // `.room-restricted__content::before` — the key over "L'accès à l'appart est restreint."
    const ROOM_KEY = new URL('../assets/room_key.png', import.meta.url).href;

    let {params = {}} = $props();

    let room = $state(null);
    let loading = $state(true);

    $effect(() =>
    {
        const id = params.id;
        let cancelled = false;

        loading = true;

        void api.getRoom(id)
            .then((answer) => !cancelled && (room = answer))
            .catch(() => !cancelled && (room = null))
            .finally(() => !cancelled && (loading = false));

        return () => (cancelled = true);
    });
</script>

{#if loading}
    <main class="mx-auto max-w-[1200px] px-3 py-6"></main>
{:else if !room}
    <main class="mx-auto max-w-[1200px] px-3 py-6">
        <h1>Cet appart n'existe pas</h1>
        <p><a href="/community/rooms" use:link>{t('ROOMS_TITLE')}</a></p>
    </main>
{:else if !room.doorOpen}
    <!-- `room.html` branches before anything else: `<habbo-room-restricted ng-if="room.doorMode !=
         'open'">` against `<habbo-room-open ng-if="room.doorMode == 'open'">`. A room behind a
         doorbell or a password does NOT get the full page — it gets the key, its name, the
         explanation, and the enter button, because entering is still allowed: what the web page
         cannot show is what is inside.

         `.room-restricted__content` is centred with the 264x212 key as a `::before`. -->
    <main class="mx-auto max-w-[1200px] px-3 pt-3 pb-6">
        <section class="text-center">
            <img src={ROOM_KEY} alt="" class="mx-auto mb-3 block h-[212px] w-[264px] [image-rendering:pixelated]" />

            <h3>{t('ROOM_RESTRICTED_TITLE')}</h3>
            <h4 class="normal-case">{room.name}</h4>
            <div class="mb-6">{t('ROOM_RESTRICTED_TEXT')}</div>

            {#if $signedIn}
                <a href="/hotel" use:link
                   class="inline-block rounded-[5px] border-2 border-[#ffea00] bg-[#ffb900] py-1.5 pr-1.5 pl-3 text-center font-condensed text-base leading-[1.2] uppercase text-black shadow-btn hover:border-b-2 hover:border-[#fffd70] hover:bg-[#ffd400] active:translate-y-[2px] active:border-[#ffce37] active:bg-[#f89400] active:shadow-btn-active">
                    <span class="relative block pr-[27px] text-right leading-[26px]">
                        {t('ROOM_ENTER_BUTTON')}
                        <Sprite name="enterRoom" className="absolute top-1/2 right-0 -translate-y-1/2" />
                    </span>
                </a>
            {/if}
        </section>
    </main>
{:else}
    <main>
        <section class="mx-auto max-w-[1200px] px-3 py-6">
            <div class="flex gap-3">
                <!-- `.room__thumbnail` is NOT the gallery's plate, which this port used here:
                     114x114 on #01353c, a 2px #267b91 border, rounded 3px and the pill's shadow —
                     against `.room-item__thumbnail`'s 110x110 on #6796b1 with a 3px offset shadow.
                     Two plates, one per screen.

                     `.room__thumbnail__image` would lay the owner's photo over this at 0,0. There is
                     no photo to lay: see the note at the top of the file.

                     `self-start` because habbo.com's is `float:left` with a fixed 114px height, and
                     a flex child stretches to the row instead — which is why this plate used to run
                     the whole height of the panel beside it. -->
                <div class="shrink-0 self-start rounded-[3px] border-2 border-pill-line bg-[#01353c] shadow-pill">
                    <Sprite name="roomThumbnail" />
                </div>

                <div class="min-w-0 flex-1">
                    <h1 class="mt-0 normal-case">{room.name}</h1>

                    <div class="flex flex-col gap-6 lg:flex-row lg:items-start">
                        <div class="min-w-0 flex-1">
                            <!-- The same `<habbo-avatar>` as the gallery card, and the name is its
                                 `<h6 class="avatar__title">` — condensed and white at 400, never
                                 bold. `.room__owner--user .avatar__image` puts 6px between them,
                                 where the gallery's puts 3. -->
                            <a href="/profile/{room.ownerName}" use:link class="flex items-center gap-1.5 hover:border-b-0">
                                <Avatar user={room.ownerName} well={46} />
                                <h6 class="m-0 truncate">{room.ownerName}</h6>
                            </a>

                            <!-- `.room-info`: a label column and a value column, not a paragraph. -->
                            <ul class="mt-6">
                                <li class="flex gap-6 py-1.5">
                                    <h3 class="m-0 w-[140px] shrink-0">{t('ROOM_DESCRIPTION')}</h3>
                                    <span class="min-w-0">{room.description}</span>
                                </li>
                                <li class="flex gap-6 py-1.5">
                                    <h3 class="m-0 w-[140px] shrink-0">{t('ROOM_TAGS')}</h3>
                                    <span class="min-w-0">{(room.tags ?? []).join(', ')}</span>
                                </li>
                            </ul>

                            <!-- `.room__enter-button` is the site's one GOLD button, and the only
                                 one with black text: `#ffb900` on `#ffea00`, hover `#ffd400`/`#fffd70`,
                                 active `#f89400`/`#ffce37`. It is not the green "play" ramp — that
                                 belongs to the navigation's hotel button — and it carries a little
                                 door in the 27px of padding it reserves on its right. -->
                            {#if $signedIn}
                                <a href="/hotel" use:link
                                   class="mt-6 mb-3 inline-block rounded-[5px] border-2 border-[#ffea00] bg-[#ffb900] py-1.5 pr-1.5 pl-3 text-center font-condensed text-base leading-[1.2] uppercase text-black shadow-btn hover:border-b-2 hover:border-[#fffd70] hover:bg-[#ffd400] active:translate-y-[2px] active:border-[#ffce37] active:bg-[#f89400] active:shadow-btn-active">
                                    <span class="relative block pr-[27px] text-right leading-[26px]">
                                        {t('ROOM_ENTER_BUTTON')}
                                        <Sprite name="enterRoom" className="absolute top-1/2 right-0 -translate-y-1/2" />
                                    </span>
                                </a>
                            {/if}
                        </div>

                        <div class="w-full shrink-0 lg:w-[340px]">
                            <div class="overflow-hidden rounded-[3px] bg-card">
                                <h3 class="m-0 bg-panel-head px-3 py-1.5 [text-shadow:0_1px_#000]">{t('ROOM_DETAILS')}</h3>
                                <dl class="px-3 py-3">
                                    <div class="flex justify-between gap-3 py-0.5">
                                        <dt class="font-bold">{t('ROOM_RATING')}</dt>
                                        <dd>{room.score ?? 0}</dd>
                                    </div>
                                    <div class="flex justify-between gap-3 py-0.5">
                                        <dt class="font-bold">{t('ROOM_MAX_USERS')}</dt>
                                        <dd>{room.maximumVisitors}</dd>
                                    </div>
                                </dl>
                            </div>

                            <p class="mt-3">
                                <a href="/help" use:link class="flex items-center gap-1.5">
                                    <Sprite name="report" />
                                    {t('ROOM_REPORT_ACTION')}
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- `<habbo-room-picture>` goes here on habbo.com: `.room-picture__wrapper`, black, centred,
             with a 25px shadow off its top edge, holding `room.imageUrl`. Nothing answers that field
             yet — see the note at the top of the file — and habbo.com's own `habbo-remove-on-error`
             takes the element away when the image does not load, so an empty black band would be
             less faithful than no band at all. -->
    </main>
{/if}
