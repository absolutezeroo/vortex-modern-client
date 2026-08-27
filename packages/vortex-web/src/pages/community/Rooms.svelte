<script>
    // `community/rooms/rooms.html`: the page-header band, then a flat list of `.room-item`. The
    // geometry is habbo.com's own and nothing about it is a list-with-dividers:
    //
    //   .room-item            { min-height: 110px; padding-left: 122px; position: relative; margin-bottom: 24px }
    //   .room-item__thumbnail { 110x110 at left:0/top:0, box-shadow 3px 3px, background #6796b1 }
    //   .room-item__thumbnail::before  the DEFAULT appart picture, straight out of the sprite
    //   .room-item__title     { font-size: 24px; margin: 0; text-transform: NONE }
    //   .room-item__description { font-size: 14px; margin: 6px 0 }
    //   .room-item__owner--user::before  a 46px teal circle at left:0/top:6px, behind the head
    //
    // The title keeping its own case matters: an appart called "Ndrangheta, Grande Palazzo" is not
    // shouted on habbo.com, and uppercasing every name is immediately wrong.
    //
    // Apparts are mocked (lib/mock.js -> ROOMS): the navigator's data reaches the client over the
    // game socket, not the web API.
    import {link} from 'svelte-spa-router';
    import CommunityShell from './CommunityShell.svelte';
    import PageHeader from '../../components/PageHeader.svelte';
    import Sprite from '../../components/Sprite.svelte';
    import Avatar from '../../components/Avatar.svelte';
    import {t} from '../../lib/i18n.js';
    import {ROOMS} from '../../lib/mock.js';
</script>

<CommunityShell>
<PageHeader title={t('ROOMS_TITLE')} description={t('ROOMS_DESCRIPTION')} illustration />

<section class="mx-auto max-w-[1200px] px-3 py-6">
    {#each ROOMS as room (room.id)}
        <div class="relative mb-6 min-h-[110px] pl-[122px]">
            <a href="/room/{room.id}" use:link class="absolute top-0 left-0 block hover:border-b-0">
                <span class="block bg-[#6796b1] shadow-[3px_3px_rgba(0,0,0,0.3)]">
                    <Sprite name="roomThumbnail" />
                </span>
            </a>

            <a href="/room/{room.id}" use:link class="block hover:border-b-0">
                <h2 class="m-0 text-2xl normal-case">{room.name}</h2>
            </a>

            <p class="my-1.5 text-sm">{room.description}</p>

            <div class="relative block">
                <a href="/profile/{room.owner}" use:link class="flex items-center gap-3 hover:border-b-0">
                    <Avatar user={room.owner} well={46} />
                    <span>{room.owner} — {room.users}/{room.maxUsers} habbos</span>
                </a>
            </div>
        </div>
    {/each}
</section>
</CommunityShell>
