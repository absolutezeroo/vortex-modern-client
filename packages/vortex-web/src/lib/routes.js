// habbo.com's own route table, read off the `$stateProvider` / `.when()` calls in
// sources/habbo.js. It is not the one this port started with, and the differences are structural:
//
//   - there is NO /me. The home IS `/`, and it shows the news feed to everyone; being signed out
//     changes the HEADER (the large register banner), not the route.
//   - every section is TABBED, and **each tab is its own `$state` with its own template**. That is
//     one page per tab here too: `pages/settings/*`, `pages/shop/*`, `pages/playing/*`,
//     `pages/community/*`, each wrapping the section's shell. Folding a section into one file with
//     a branch per URL is what this table used to encourage, and it flattened three sections.
//   - an article is `/article/:id/:title`, not `/community/articles/:id`.
//   - avatar selection lives under settings (`/settings/avatars`), not at the top level.
//   - the footer's terms and privacy links point INSIDE playing-habbo
//     (`FOOTER_TOS_LINK = /playing-habbo/terms-of-service`), not at top-level pages.
//   - there is no group page anywhere on habbo.com: groups appear as lists on a profile and link
//     into the client, so this port does not invent one.
//   - habbo.com's eighth settings tab, `/settings/wallet` (Metamask), is deliberately absent.
//
// Pages load on demand: `load` must stay a literal `() => import('../pages/X.svelte')` or Vite
// cannot see the import statically and folds every page back into one chunk. The home is eager
// because every visitor lands on it, and the 404 because it is what the router falls back TO —
// including when a chunk fails to fetch.

import {wrap} from 'svelte-spa-router/wrap';
import {get} from 'svelte/store';
import {signedIn} from './session.js';
import HomePage from '../pages/HomePage.svelte';
import NotFoundPage from '../pages/NotFoundPage.svelte';

// A guard, not a security boundary: the API refuses an unauthenticated call on its own. This only
// keeps a signed-out visitor off a screen that would render empty.
function authed()
{
    return get(signedIn);
}

function guarded(load)
{
    return wrap({asyncComponent: load, conditions: [authed]});
}

function open(load)
{
    return wrap({asyncComponent: load});
}

export const routes = {
    '/': HomePage,
    '/messaging': guarded(() => import('../pages/MessagingPage.svelte')),
    '/registration': open(() => import('../pages/RegisterPage.svelte')),

    '/hotel': guarded(() => import('../pages/HotelPage.svelte')),

    // community — `community/community.html` + one state per tab.
    '/community': open(() => import('../pages/community/News.svelte')),
    '/community/category': open(() => import('../pages/community/News.svelte')),
    '/community/category/:category': open(() => import('../pages/community/News.svelte')),
    '/community/photos': open(() => import('../pages/community/Photos.svelte')),
    '/community/rooms': open(() => import('../pages/community/Rooms.svelte')),
    '/community/fansites': open(() => import('../pages/community/Fansites.svelte')),
    '/article/:id': open(() => import('../pages/community/Article.svelte')),
    '/article/:id/:title': open(() => import('../pages/community/Article.svelte')),

    // playing-habbo — five CMS pages, each declaring its own side boxes.
    '/playing-habbo': open(() => import('../pages/playing/WhatIsHabbo.svelte')),
    '/playing-habbo/what-is-habbo': open(() => import('../pages/playing/WhatIsHabbo.svelte')),
    '/playing-habbo/how-to-play': open(() => import('../pages/playing/HowToPlay.svelte')),
    '/playing-habbo/habbo-way': open(() => import('../pages/playing/HabboWay.svelte')),
    '/playing-habbo/safety': open(() => import('../pages/playing/Safety.svelte')),
    '/playing-habbo/help': open(() => import('../pages/playing/Help.svelte')),

    '/habbo-nft': open(() => import('../pages/StaticPage.svelte')),

    // shop — three genuinely different templates.
    '/shop': open(() => import('../pages/shop/Store.svelte')),
    '/shop/prepaid': open(() => import('../pages/shop/Prepaid.svelte')),
    '/shop/history': open(() => import('../pages/shop/Transactions.svelte')),

    '/profile': guarded(() => import('../pages/ProfilePage.svelte')),
    '/profile/:name': open(() => import('../pages/ProfilePage.svelte')),

    '/room/:id': open(() => import('../pages/RoomPage.svelte')),
    '/rooms': open(() => import('../pages/community/Rooms.svelte')),

    // settings — six states, six pages, one shell.
    '/settings': guarded(() => import('../pages/settings/PrivacySettings.svelte')),
    '/settings/privacy': guarded(() => import('../pages/settings/PrivacySettings.svelte')),
    '/settings/security': guarded(() => import('../pages/settings/AccountSecurity.svelte')),
    '/settings/2fa': guarded(() => import('../pages/settings/TwoFactorAuth.svelte')),
    '/settings/password': guarded(() => import('../pages/settings/PasswordChange.svelte')),
    '/settings/email': guarded(() => import('../pages/settings/EmailChange.svelte')),
    '/settings/avatars': guarded(() => import('../pages/settings/AvatarSelection.svelte')),

    // The remaining editorial pages habbo.com serves out of its CMS.
    '/safety': open(() => import('../pages/StaticPage.svelte')),
    '/help': open(() => import('../pages/StaticPage.svelte')),
    '/terms': open(() => import('../pages/StaticPage.svelte')),
    '/privacy': open(() => import('../pages/StaticPage.svelte')),
    '/staff': open(() => import('../pages/StaticPage.svelte')),
    '/forgot': open(() => import('../pages/StaticPage.svelte')),

    '*': NotFoundPage,
};
