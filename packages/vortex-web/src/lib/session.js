import {writable, derived, get} from 'svelte/store';
import * as api from './api.js';

// The signed-in account, as far as this tab knows. `avatars` is the API's own list; `selectedId` is
// the one the site is acting as — the server keeps that on the session but never returns it, so the
// copy here is the only thing the UI can render from. It is persisted per tab so a reload does not
// silently switch avatar under the visitor.
const STORED_AVATAR = 'vortex-web.avatar';

export const avatars = writable([]);
export const selectedId = writable(sessionStorage.getItem(STORED_AVATAR) ?? '');
export const ready = writable(false);

// Set when the identity probe could not reach the API at all. It is NOT fatal: the editorial half
// of the site — community, shop, the static pages — has nothing to ask the emulator for, and taking
// the whole site down because the game server is restarting is worse than a banner.
export const outage = writable('');

export const me = derived([avatars, selectedId], ([$avatars, $selectedId]) =>
    $avatars.find((avatar) => avatar.uniqueId === $selectedId) ?? $avatars[0] ?? null);

export const signedIn = derived([avatars, ready], ([$avatars, $ready]) => $ready && $avatars.length > 0);

selectedId.subscribe((value) =>
{
    if(value)
    {
        sessionStorage.setItem(STORED_AVATAR, value);
    }
    else
    {
        sessionStorage.removeItem(STORED_AVATAR);
    }
});

// Called once at boot and after every flow that can change the list. A 401 here is the ordinary
// signed-out case, not a fault: the API has no identity route, so this IS the identity probe.
export async function refresh()
{
    try
    {
        const list = await api.getAvatars();

        avatars.set(Array.isArray(list) ? list : []);
        outage.set('');

        if(!get(selectedId) && list?.length)
        {
            selectedId.set(list[0].uniqueId);
        }
    }
    catch(error)
    {
        avatars.set([]);
        selectedId.set('');
        outage.set(api.isAuthError(error) ? '' : error.message);
    }
    finally
    {
        ready.set(true);
    }
}

export async function choose(uniqueId)
{
    await api.selectAvatar(uniqueId);
    selectedId.set(uniqueId);
}

export async function signOut()
{
    try
    {
        await api.logout();
    }
    finally
    {
        avatars.set([]);
        selectedId.set('');
    }
}
