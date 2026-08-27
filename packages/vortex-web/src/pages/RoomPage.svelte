<script>
    // `/room/:id` — `room/room.html` -> `room/room-open/room-open.html`:
    //
    //   .room__thumbnail          110x110, top left
    //   .room__content__title     the appart's name, in ITS OWN case
    //   .room__content__left      owner avatar, then <habbo-room-info>, then the enter button
    //   .room-info                a two-column list: "Description" / value, "Tags" / value
    //   .room__content__right     .room__details — "Détails de l'appart", Note + Nombre de personne
    //                             .room__actions — "Rapporter l'appart"
    //   <habbo-room-picture>      the RENDER of the appart, full width UNDER the section
    //
    // That last element is the point of the page and this port had nothing in its place. The render
    // comes from packages/vortex-imager (`GET /habbo-imaging/room/:roomId`), which draws the appart
    // with the client's own renderer — so the picture here is the room, not a stock thumbnail.
    // `.room-picture__wrapper` is black with a 25px shadow falling from its top edge.
    //
    // Appart data is mocked (lib/mock.js -> ROOMS): the navigator lives behind the game socket.
    import {link} from 'svelte-spa-router';
    import Sprite from '../components/Sprite.svelte';
    import Avatar from '../components/Avatar.svelte';
    import {ROOMS} from '../lib/mock.js';
    import {roomUrl, hideOnError} from '../lib/config.js';
    import {t} from '../lib/i18n.js';
    import {signedIn} from '../lib/session.js';

    let {params = {}} = $props();

    const room = $derived(ROOMS.find((entry) => String(entry.id) === String(params.id)) ?? null);
</script>

{#if !room}
    <main class="mx-auto max-w-[1200px] px-3 py-6">
        <h1>Cet appart n'existe pas</h1>
        <p><a href="/community/rooms" use:link>{t('ROOMS_TITLE')}</a></p>
    </main>
{:else}
    <main>
        <section class="mx-auto max-w-[1200px] px-3 py-6">
            <div class="flex gap-3">
                <div class="shrink-0 bg-[#6796b1] shadow-[3px_3px_rgba(0,0,0,0.3)]">
                    <Sprite name="roomThumbnail" />
                </div>

                <div class="min-w-0 flex-1">
                    <h1 class="mt-0 normal-case">{room.name}</h1>

                    <div class="flex flex-col gap-6 lg:flex-row lg:items-start">
                        <div class="min-w-0 flex-1">
                            <a href="/profile/{room.owner}" use:link class="flex items-center gap-3 hover:border-b-0">
                                <Avatar user={room.owner} well={46} />
                                <span class="font-bold">{room.owner}</span>
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
                                        <dd>{room.rating ?? 0}</dd>
                                    </div>
                                    <div class="flex justify-between gap-3 py-0.5">
                                        <dt class="font-bold">{t('ROOM_MAX_USERS')}</dt>
                                        <dd>{room.maxUsers}</dd>
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

        <!-- `.room-picture__wrapper`: black, centred, with a 25px shadow off its top edge. -->
        <div class="relative w-full overflow-hidden bg-black text-center after:absolute after:top-0 after:left-0 after:h-[25px] after:w-full after:bg-gradient-to-b after:from-black/50 after:to-transparent after:content-['']">
            <img src={roomUrl(room.id)} alt={room.name} onerror={hideOnError}
                 class="mx-auto max-w-full [image-rendering:auto]" />
        </div>
    </main>
{/if}
