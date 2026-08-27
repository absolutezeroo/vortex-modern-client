// Every call here is a route the emulator's web API actually serves — see
// ../../vortex-emulator/Vortex.WebApi/Hosting/WebApiEndpoints.cs, which is the contract this file
// mirrors. Authentication is a session COOKIE issued by the login endpoint (HttpOnly, so it is
// invisible to this code); there is no token to carry, which is also why the dev server proxies
// /api instead of pointing at :8080 — a cross-origin request would drop the cookie.
//
// The API has no "who am I" route. GET /api/user/avatars is the identity probe: it answers 401 with
// no session and the account's avatars with one, which is exactly what the ported client's
// LoginFlow leans on too.

const ERRORS = {
    'pocket.auth.missing_credentials': 'Il manque ton nom ou ton mot de passe.',
    'pocket.auth.invalid_login': 'Nom ou mot de passe incorrect.',
    'pocket.auth.mfa_required': 'Entre le code de ton application d\'authentification.',
    'pocket.auth.invalid_code': 'Ce code n\'est pas valide.',
    'pocket.auth.password_too_short': 'Ce mot de passe est trop court.',
    'pocket.auth.wrong_password': 'Mot de passe actuel incorrect.',
    'pocket.auth.no_avatars': 'Ce compte n\'a pas encore d\'avatar.',
    'pocket.auth.name_taken': 'Ce nom est deja pris.',
    'email_taken': 'Cette adresse e-mail est deja utilisee.',
    'avatar_not_owned': 'Cet avatar n\'appartient pas a ce compte.',
    'invalid_request': 'Requete invalide.',
    'article_not_found': 'Cet article n\'existe pas.',
    'hotel_unreachable': 'L\'hotel ne repond pas.',
};

export class ApiError extends Error
{
    constructor(code, status, options = {})
    {
        super(ERRORS[code] ?? code ?? 'La connexion a echoue.');
        this.name = 'ApiError';
        this.code = code ?? 'request_failed';
        this.status = status ?? 0;

        if(options.cause)
        {
            this.cause = options.cause;
        }
    }
}

export function isAuthError(error)
{
    return error?.status === 401;
}

export function needsMfa(error)
{
    return error?.code === 'pocket.auth.mfa_required';
}

async function request(path, options = {})
{
    let response;

    try
    {
        response = await fetch(path, {
            credentials: 'same-origin',
            headers: options.body ? {'Content-Type': 'application/json'} : undefined,
            ...options,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });
    }
    catch(cause)
    {
        // The hotel being down and the hotel refusing you are different screens, so the transport
        // failure keeps its own code rather than collapsing into a generic error.
        throw new ApiError('hotel_unreachable', 0, {cause});
    }

    // The endpoints that answer a bare `{}` parse to something empty-but-fine; a body that is not
    // JSON at all is a proxy or a crash, never the API.
    let payload;

    try
    {
        payload = await response.json();
    }
    catch
    {
        payload = null;
    }

    if(!response.ok)
    {
        throw new ApiError(payload?.error, response.status);
    }

    return payload;
}

export function hello()
{
    return request('/api/public/info/hello');
}

// -> { default, items: [{ code, label }] }. The languages the hotel publishes in.
export function getLanguages()
{
    return request('/api/public/languages');
}

// -> { lang, page, pageSize, total, categories: [{ id, label }], items: [ArticleSummary] }
//
// Anonymous by design — the front page has to render with no session at all — and the server does
// the ordering: pinned first, then newest. `lang` in the answer is the language actually served,
// which may not be the one asked for; a summary then carries `fallback: true`.
export function getArticles(options = {})
{
    const query = new URLSearchParams();

    if(options.category && options.category !== 'tout')
    {
        query.set('category', options.category);
    }

    if(options.page)
    {
        query.set('page', String(options.page));
    }

    if(options.pageSize)
    {
        query.set('pageSize', String(options.pageSize));
    }

    const suffix = query.size ? `?${query}` : '';

    return request(`/api/public/articles${suffix}`);
}

// -> { lang, article, body, related: [{ id, title }] }, or 404 `article_not_found`.
//
// `body` is the stored block array — never HTML. See components/ArticleBody.svelte.
export function getArticle(slug)
{
    return request(`/api/public/articles/${encodeURIComponent(slug)}`);
}

// -> { requiresOnboarding: boolean }. A 401 carrying `pocket.auth.mfa_required` is not a refusal,
// it is the server asking for the second factor — see needsMfa().
export function login(email, password, code)
{
    return request('/api/public/authentication/login', {
        method: 'POST',
        body: {email, password, ...(code ? {code} : {})},
    });
}

// -> { id }. The server logs the new account in as part of the same call, so there is no second
// round trip and the cookie is already set when this resolves.
export function register(email, password, passwordRepeated)
{
    return request('/api/public/registration/new', {
        method: 'POST',
        body: {email, password, passwordRepeated},
    });
}

export function logout()
{
    return request('/api/public/authentication/logout', {method: 'POST'});
}

// -> { sessionsRevoked }. Note this ends EVERY session of the account including the caller's: the
// endpoint clears the cookie itself, so the page must return to the landing screen afterwards.
export function changePassword(currentPassword, newPassword, code)
{
    return request('/api/public/authentication/password', {
        method: 'POST',
        body: {currentPassword, newPassword, ...(code ? {code} : {})},
    });
}

// -> [{ uniqueId, name, motto, figureString, gender }]
export function getAvatars()
{
    return request('/api/user/avatars');
}

// -> the refreshed list, same shape as getAvatars().
export function createAvatar(name, figure, gender)
{
    return request('/api/user/avatars', {method: 'POST', body: {name, figure, gender}});
}

// Which avatar the next SSO ticket belongs to. The choice is stored server-side on the session and
// is never read back, so lib/session.js keeps its own copy for the UI.
export function selectAvatar(uniqueId)
{
    return request('/api/user/avatars/select', {method: 'POST', body: {uniqueId}});
}

// -> { ssoToken }. This is the ticket the client trades for a connection; it is single-use, so
// /hotel asks for a fresh one on every mount.
export function ssoToken(uniqueId)
{
    const query = uniqueId ? `?uniqueId=${encodeURIComponent(uniqueId)}` : '';

    return request(`/api/ssotoken${query}`);
}

// -> { name, valid }
export function checkName(name)
{
    return request('/api/newuser/name/check', {method: 'POST', body: {name}});
}

// -> { name }, or a 200 carrying { error: 'pocket.auth.name_taken' } — the taken case is NOT an
// HTTP failure, so callers must test the payload, not the status.
export function selectName(name, playerId)
{
    return request('/api/newuser/name/select', {method: 'POST', body: {name, playerId}});
}

export function saveLook(figureString, gender, playerId)
{
    return request('/api/user/look/save', {method: 'POST', body: {figureString, gender, playerId}});
}
