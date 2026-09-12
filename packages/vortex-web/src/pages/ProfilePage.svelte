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
    // Real since 2026-09-11: `GET /api/public/users?name=` resolves the name the route carries, then
    // `GET /api/public/users/{uniqueId}/profile` answers the four lists. Both are anonymous, so a
    // signed-out visitor opening a profile link gets the page, which is what habbo.com does.
    import {link} from 'svelte-spa-router';
    import Avatar from '../components/Avatar.svelte';
    import Sprite from '../components/Sprite.svelte';
    import EmptyResults from '../components/EmptyResults.svelte';
    import {me} from '../lib/session.js';
    import * as api from '../lib/api.js';
    import {loadBadgeTexts, badgeName} from '../lib/badges.js';
    import {badgeUrl, groupBadgeUrl, roomUrl, hideOnError} from '../lib/config.js';
    import {t} from '../lib/i18n.js';

    // `.profile__card__wrapper--<kind> .profile__card__aligner::before`: a 140px-tall illustration
    // hanging ABOVE each card, which the aligner's own `margin-top:140px` reserves the room for.
    // The four PNGs were already mirrored into src/assets/ and had never been used.
    const TEASERS = {
        badges: new URL('../assets/teaser_profile_badges.png', import.meta.url).href,
        friends: new URL('../assets/teaser_profile_friends.png', import.meta.url).href,
        rooms: new URL('../assets/teaser_profile_rooms.png', import.meta.url).href,
        groups: new URL('../assets/teaser_profile_groups.png', import.meta.url).href,
    };

    let {params = {}} = $props();

    // habbo.com's footer opens `habbo-profile-modal` over the page with the full list. There is no
    // modal here yet, so "Tout voir" unfolds the card in place — same items, same order, one state
    // per card. Swap the body for a modal when one exists; the footer markup does not change.
    let expanded = $state({badges: false, friends: false, rooms: false, groups: false});

    const FIVE = 5;

    // Same format as the news feed's dates, which is the only other date the site prints.
    function joined(date)
    {
        return new Date(date).toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'});
    }

    // `/profile` with no name is the signed-in player's own, which is how the user menu links here.
    const wanted = $derived(params.name || $me?.name || '');
    const own = $derived(!params.name || params.name === $me?.name);

    let profile = $state(null);
    let texts = $state({});
    let error = $state('');
    let loading = $state(true);

    const user = $derived(profile?.user ?? null);
    const badges = $derived(profile?.badges ?? []);
    const friends = $derived(profile?.friends ?? []);
    const rooms = $derived(profile?.rooms ?? []);
    const groups = $derived(profile?.groups ?? []);

    $effect(() =>
    {
        const name = wanted;
        let cancelled = false;

        loading = true;
        error = '';

        (async () =>
        {
            if(!name)
            {
                // Signed out, no name in the URL: there is no profile to ask for.
                if(!cancelled)
                {
                    loading = false;
                }

                return;
            }

            try
            {
                const found = await api.getUser(name);
                const answer = await api.getProfile(found.uniqueId);

                // The badge texts are a second fetch and a big one; the page must not wait on it to
                // render, so the labels fill in when it lands.
                void loadBadgeTexts().then((loaded) =>
                {
                    if(!cancelled)
                    {
                        texts = loaded;
                    }
                });

                if(!cancelled)
                {
                    profile = answer;
                }
            }
            catch(failure)
            {
                if(!cancelled)
                {
                    profile = null;
                    error = failure?.message ?? '';
                }
            }
            finally
            {
                if(!cancelled)
                {
                    loading = false;
                }
            }
        })();

        return () => (cancelled = true);
    });
</script>

<!-- `.profile__header`: the avatar stands on the page's own background, name and motto beside it. -->
<header class="mx-auto flex max-w-[1200px] items-end gap-6 px-3 py-6">
    <Avatar figure={user?.figureString ?? ''} size="l" direction={2} className="shrink-0" />

    <div class="min-w-0 flex-1">
        <h1 class="mb-0">{user?.name ?? wanted}</h1>
        {#if user?.motto}
            <!-- `.profile__motto`: Ubuntu Habbo, 14px, with habbo.com's own text shadow. -->
            <div class="text-sm [text-shadow:0_1px_rgba(0,0,0,0.3)]">{user.motto}</div>
        {/if}
    </div>

    {#if own}
        <p class="shrink-0"><a href="/settings" use:link class="font-condensed uppercase">{t('NAVIGATION_SETTINGS')}</a></p>
    {/if}
</header>

<main class="mx-auto max-w-[1200px] px-3">
    {#if error}
        <EmptyResults className="py-12" />
    {:else if user && !user.profileVisible}
        <!-- The server answers a private profile with its header and four empty lists, so without
             this the page would be a name, a motto and a blank space — which reads as broken rather
             than as closed. habbo.com ships no key for the sentence, so `PROFILE_VISIBILITY_INFO` —
             the one the registration form uses to promise this very behaviour — says it. -->
        <p class="py-12 text-center">{t('PROFILE_VISIBILITY_INFO')}</p>
    {:else if !loading}
        <!-- `.profile__section{margin-left:-12px}` against `.profile__card__aligner{padding-left:12px}`:
             a 12px gutter, and two cards a row from 767px. -->
        <div class="md:-ml-3 md:flex md:flex-wrap md:items-start">
            {#if badges.length}
                {@render card('badges', TEASERS.badges, t('PROFILE_BADGES_TITLE'), '', badgeItems)}
            {/if}

            {#if friends.length}
                <!-- `.profile__friends__count`: habbo.com's own "({{current}} de {{all}})". -->
                {@render card('friends', TEASERS.friends, t('PROFILE_FRIENDS_TITLE'),
                    t('PROFILE_FRIENDS_COUNT', {current: Math.min(FIVE, friends.length), all: friends.length}), friendItems)}
            {/if}

            {#if rooms.length}
                {@render card('rooms', TEASERS.rooms, t('PROFILE_ROOMS_TITLE'), '', roomItems)}
            {/if}

            {#if groups.length}
                {@render card('groups', TEASERS.groups, t('PROFILE_GROUPS_TITLE'), '', groupItems)}
            {/if}
        </div>
    {/if}
</main>

<!-- `.profile__card__wrapper--<kind>` > `.profile__card__aligner` > `.profile__card`, all four
     identical but for the illustration and the list. -->
{#snippet card(kind, teaser, title, count, items)}
    <div class="relative mt-[140px] pb-3 md:w-1/2 md:pl-3">
        <img src={teaser} alt="" class="pointer-events-none absolute -top-[140px] left-0 h-[140px] [image-rendering:pixelated] md:left-3" />

        <!-- `.profile__card`: a bordered plate, no rounding, and the title is CENTRED
             (`.profile__card__title{margin:0 0 12px;text-align:center}`). -->
        <div class="border-[3px] border-card-line bg-card px-6 py-3 shadow-card">
            <h2 class="m-0 mb-3 text-center">
                {title}{#if count}<span class="ml-1.5 text-base text-ink">{count}</span>{/if}
            </h2>

            <!-- `.item-list--grid .item`: 50% a row, 33% from 532px, 20% from 1199px. -->
            <ul class="flex flex-wrap">{@render items()}</ul>

            <!-- `.profile__card__footer{border-top:1px solid #2a9cde;padding:12px 0 0;text-align:center}`
                 holding `.profile-modal__link` (20px, uppercase, the arrow pinned right in 22px). -->
            <div class="mt-3 border-t border-rule pt-3 text-center">
                <button type="button" onclick={() => (expanded[kind] = !expanded[kind])}
                        class="relative inline-block pr-[22px] font-condensed text-xl leading-7 text-white uppercase">
                    {t('SEE_ALL')}
                    <Sprite name="profileMore" className="absolute top-1/2 right-0 -translate-y-1/2" />
                </button>
            </div>
        </div>
    </div>
{/snippet}

<!-- `.item-list--grid .item__title` is #7ecaee and centred — but `a[href] .item__title` turns it
     white, so only the badges (the one list whose items link nowhere) keep the blue. And
     `.item-list--grid .item__description{display:none}`: the occupancy and the group motto below
     belong to the stacked list, not to this one. -->
{#snippet badgeItems()}
    {#each (expanded.badges ? badges : badges.slice(0, FIVE)) as badge (badge.code)}
        <li class="w-1/2 pb-3 text-center xs:w-1/3 xl:w-1/5">
            <span class="mx-auto flex h-[60px] w-[60px] items-center justify-center rounded-full border-[3px] border-card-line">
                <img src={badgeUrl(badge.code)} alt="" width="40" height="40" onerror={hideOnError} />
            </span>
            <span class="mt-1.5 block px-1.5 text-ink">{badgeName(texts, badge.code)}</span>
        </li>
    {/each}
{/snippet}

{#snippet friendItems()}
    {#each (expanded.friends ? friends : friends.slice(0, FIVE)) as friend (friend.uniqueId)}
        <li class="w-1/2 pb-3 text-center xs:w-1/3 xl:w-1/5">
            <a href="/profile/{friend.name}" use:link class="block hover:border-b-0">
                <Avatar figure={friend.figureString} well={60} className="mx-auto" />
                <span class="mt-1.5 block px-1.5">{friend.name}</span>
            </a>
        </li>
    {/each}
{/snippet}

<!-- `.item--room .item__icon{height:90px;width:90px}`: the room picture is BIGGER than the 60px
     well and overflows it, the way the head does in `Avatar`. The picture is the room itself,
     rendered by packages/vortex-imager — `hideOnError` leaves the well empty when it is not up,
     which is what every other imager-backed picture on the site does. -->
{#snippet roomItems()}
    {#each (expanded.rooms ? rooms : rooms.slice(0, FIVE)) as room (room.id)}
        <li class="w-1/2 pb-3 text-center xs:w-1/3 xl:w-1/5">
            <a href="/room/{room.id}" use:link class="block hover:border-b-0">
                <span class="mx-auto flex h-[60px] w-[60px] items-center justify-center rounded-full border-[3px] border-card-line">
                    <img src={roomUrl(room.id)} alt="" class="h-[90px] w-[90px] max-w-none object-contain" onerror={hideOnError} />
                </span>
                <span class="mt-1.5 block px-1.5">{room.name}</span>
            </a>
        </li>
    {/each}
{/snippet}

<!-- groups: the group's OWN room, not a group page — habbo.com has none. -->
{#snippet groupItems()}
    {#each (expanded.groups ? groups : groups.slice(0, FIVE)) as group (group.id)}
        <li class="w-1/2 pb-3 text-center xs:w-1/3 xl:w-1/5">
            <a href="/room/{group.roomId}" use:link class="block hover:border-b-0">
                <span class="mx-auto flex h-[60px] w-[60px] items-center justify-center rounded-full border-[3px] border-card-line">
                    <img src={groupBadgeUrl(group.badgeCode)} alt="" width="40" height="40" onerror={hideOnError} />
                </span>
                <span class="mt-1.5 block px-1.5">{group.name}</span>
            </a>
        </li>
    {/each}
{/snippet}

<!-- `.profile__joined` + `.profile__hearts` -->
{#if user}
    <footer class="mx-auto max-w-[1200px] px-3 py-6 text-center">
        <h2 class="m-0">{t('PROFILE_JOINED', {date: joined(user.memberSince)})}</h2>
        <div class="mt-3 flex justify-center gap-1.5">
            <Sprite name="heart" />
            <Sprite name="heart" />
            <Sprite name="heart" />
        </div>
    </footer>
{/if}
