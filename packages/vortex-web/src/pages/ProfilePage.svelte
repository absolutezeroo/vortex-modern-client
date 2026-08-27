<script>
    // `/profile/:name` — `profile/profile.html`, whose shape is specific and was guessed wrong here
    // before:
    //
    //   the profile header sits INSIDE the small header (`habbo-header-small class="profile__header"`)
    //   <main class="wrapper wrapper--content">
    //     .profile__card__wrapper--badges  > .profile__card > h2.profile__card__title + list + footer
    //     …--friends, …--rooms, …--groups   (that order; a card is omitted when its list is empty)
    //   <footer>  "membre depuis <date>" + THREE hearts
    //
    // Each card shows at most five items and its footer opens a modal with the rest — hence
    // "5 / 23" beside the friends title. And a group links to `/hotel?room=<id>`, never to a group
    // page: habbo.com has no such page, which is why this port no longer has one either.
    //
    // Own profile reads the session (real, from GET /api/user/avatars); somebody else's falls back
    // to the mocked friend list, because the web API has no public-profile route.
    import {link} from 'svelte-spa-router';
    import Avatar from '../components/Avatar.svelte';
    import Sprite from '../components/Sprite.svelte';
    import {me} from '../lib/session.js';
    import {BADGES, FRIENDS, GROUPS, ROOMS} from '../lib/mock.js';
    import {badgeUrl, groupBadgeUrl, IMAGES, hideOnError} from '../lib/config.js';
    import {t} from '../lib/i18n.js';

    let {params = {}} = $props();

    const own = $derived(!params.name || params.name === $me?.name);

    const profile = $derived(own
        ? {name: $me?.name ?? 'Habbo', figure: $me?.figureString ?? '', motto: $me?.motto ?? ''}
        : {
            name: params.name,
            figure: FRIENDS.find((friend) => friend.name === params.name)?.figure ?? '',
            motto: FRIENDS.find((friend) => friend.name === params.name)?.motto ?? '',
        });

    const FIVE = 5;
</script>

<!-- `.profile__header`: the avatar stands on the page's own background, name and motto beside it. -->
<header class="mx-auto flex max-w-[1200px] items-end gap-6 px-3 py-6">
    <Avatar figure={profile.figure} user={own ? profile.name : ''} size="l" direction={2} className="shrink-0" />

    <div class="min-w-0 flex-1">
        <h1 class="mb-0">{profile.name}</h1>
        {#if profile.motto}
            <div class="italic">{profile.motto}</div>
        {/if}
    </div>

    {#if own}
        <p class="shrink-0"><a href="/settings" use:link class="font-condensed uppercase">{t('NAVIGATION_SETTINGS')}</a></p>
    {/if}
</header>

<main class="mx-auto max-w-[1200px] px-3">
    <div class="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        <!-- badges -->
        {#if BADGES.length}
            <section class="rounded-[3px] bg-card p-3 xs:p-6">
                <h2 class="mt-0">{t('PROFILE_BADGES_TITLE')}</h2>
                <ul class="flex flex-wrap gap-3">
                    {#each BADGES.slice(0, FIVE) as badge (badge.code)}
                        <li><img src={badgeUrl(badge.code)} alt={badge.name} title={badge.name} width="40" height="40" /></li>
                    {/each}
                </ul>
                <p class="mt-3 text-sm">{Math.min(FIVE, BADGES.length)} / {BADGES.length}</p>
            </section>
        {/if}

        <!-- friends -->
        {#if FRIENDS.length}
            <section class="rounded-[3px] bg-card p-3 xs:p-6">
                <!-- `.profile__friends__count`: habbo.com's own "({{current}} de {{all}})". -->
                <h2 class="mt-0">
                    {t('PROFILE_FRIENDS_TITLE')}
                    <span class="text-base text-ink">
                        {t('PROFILE_FRIENDS_COUNT', {current: Math.min(FIVE, FRIENDS.length), all: FRIENDS.length})}
                    </span>
                </h2>
                <ul class="grid grid-cols-2 gap-3 xs:grid-cols-3">
                    {#each FRIENDS.slice(0, FIVE) as friend (friend.name)}
                        <li class="text-center">
                            <a href="/profile/{friend.name}" use:link class="block hover:border-b-0">
                                <Avatar figure={friend.figure} well={60} className="mx-auto" />
                                <span class="mt-1.5 block truncate font-condensed uppercase">{friend.name}</span>
                            </a>
                        </li>
                    {/each}
                </ul>
            </section>
        {/if}

        <!-- rooms -->
        {#if ROOMS.length}
            <section class="rounded-[3px] bg-card p-3 xs:p-6">
                <h2 class="mt-0">{t('PROFILE_ROOMS_TITLE')}</h2>
                <ul class="space-y-3">
                    {#each ROOMS.slice(0, FIVE) as room (room.id)}
                        <li>
                            <a href="/room/{room.id}" use:link class="flex items-center gap-3 hover:border-b-0">
                                <span class="flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-[3px] border-[3px] border-card-line bg-page">
                                    <img src="{IMAGES}/nux/home.png" alt="" class="max-h-full" />
                                </span>
                                <span class="min-w-0">
                                    <span class="block truncate font-condensed uppercase">{room.name}</span>
                                    <span class="block text-sm">{room.users}/{room.maxUsers} habbos</span>
                                </span>
                            </a>
                        </li>
                    {/each}
                </ul>
            </section>
        {/if}

        <!-- groups: `/hotel?room=<id>`, not a group page. -->
        {#if GROUPS.length}
            <section class="rounded-[3px] bg-card p-3 xs:p-6">
                <h2 class="mt-0">{t('PROFILE_GROUPS_TITLE')}</h2>
                <ul class="space-y-3">
                    {#each GROUPS.slice(0, FIVE) as group (group.id)}
                        <li>
                            <a href="/hotel" use:link class="flex items-center gap-3 hover:border-b-0">
                                <span class="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full border-[3px] border-card-line">
                                    <img src={groupBadgeUrl(group.badge)} alt="" width="40" height="40" onerror={hideOnError} />
                                </span>
                                <span class="min-w-0">
                                    <span class="block truncate font-condensed uppercase">{group.name}</span>
                                    <span class="block truncate text-sm italic">{group.motto}</span>
                                </span>
                            </a>
                        </li>
                    {/each}
                </ul>
            </section>
        {/if}
    </div>
</main>

<!-- `.profile__joined` + `.profile__hearts` -->
<footer class="mx-auto max-w-[1200px] px-3 py-6 text-center">
    <h2 class="m-0">{t('PROFILE_JOINED', {date: '12 mai 2025'})}</h2>
    <div class="mt-3 flex justify-center gap-1.5">
        <Sprite name="heart" />
        <Sprite name="heart" />
        <Sprite name="heart" />
    </div>
</footer>
