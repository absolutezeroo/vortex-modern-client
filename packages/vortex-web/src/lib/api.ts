// Every call here is a route the emulator's web API actually serves — see
// ../../vortex-emulator/Vortex.WebApi/Hosting/WebApiEndpoints.cs, which is the contract this file
// mirrors. Authentication is a session COOKIE issued by the login endpoint (HttpOnly, so it is
// invisible to this code); there is no token to carry, which is also why the dev server proxies
// /api instead of pointing at :8080 — a cross-origin request would drop the cookie.
//
// The API has no "who am I" route. GET /api/user/avatars is the identity probe: it answers 401 with
// no session and the account's avatars with one, which is exactly what the ported client's
// LoginFlow leans on too.
//
// The payload types are NOT written here. `api.generated.ts` is produced from the API's own OpenAPI
// document by `pnpm api:types`, and that document is produced from the running pipeline by
// `OpenApiDocumentTests` — so a record renamed in C# becomes a compile error in the page that reads
// it, instead of an `undefined` nobody sees until the screen is blank. The aliases below exist only
// so the pages import a name rather than a subscript chain.
import type {components} from './api.generated';

type Schemas = components['schemas'];

export type IProfileBadge = Schemas['ProfileBadge'];
export type IProfileFriend = Schemas['ProfileFriend'];
export type IProfileRoom = Schemas['ProfileRoom'];
export type IProfileGroup = Schemas['ProfileGroup'];
export type IProfileUser = Schemas['ProfileUser'];
export type IPlayerProfile = Schemas['PlayerProfile'];
export type IRoomSummary = Schemas['RoomSummary'];
export type IRoomPage = Schemas['RoomPage'];
export type IPlayerPurse = Schemas['PlayerPurse'];
export type IAvatarInfo = Schemas['AvatarInfo'];
export type IArticleSummary = Schemas['ArticleSummary'];
export type IArticleFeed = Schemas['ArticleFeed'];
export type IArticleDetail = Schemas['ArticleDetail'];
export type ISiteLanguages = Schemas['SiteLanguages'];
export type ILoginResponse = Schemas['LoginResponse'];
export type IRegistrationResponse = Schemas['RegistrationResponse'];
export type IPasswordChangeResponse = Schemas['PasswordChangeResponse'];
export type ISsoTicketResponse = Schemas['SsoTicketResponse'];
export type INameCheckResponse = Schemas['NameCheckResponse'];
export type INameSelectResponse = Schemas['NameSelectResponse'];
export type IEmptyResponse = Schemas['EmptyResponse'];
export type IPlayerPreferences = Schemas['PlayerPreferencesResponse'];
export type IAccountEmail = Schemas['AccountEmailResponse'];
export type ITwoFactorStatus = Schemas['TwoFactorStatusResponse'];
export type ITwoFactorEnrolment = Schemas['TwoFactorEnrolmentResponse'];

const ERRORS: Record<string, string> = {
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
    public readonly code: string;
    public readonly status: number;

    constructor(code?: string | null, status?: number, options: {cause?: unknown} = {})
    {
        super(ERRORS[code ?? ''] ?? code ?? 'La connexion a echoue.');
        this.name = 'ApiError';
        this.code = code ?? 'request_failed';
        this.status = status ?? 0;

        if(options.cause)
        {
            this.cause = options.cause;
        }
    }
}

// `unknown`, not `ApiError`: both of these are called from a `catch`, where TypeScript hands you
// `unknown` and asking what it was is the entire job.
export function isAuthError(error: unknown): boolean
{
    return (error as ApiError | null)?.status === 401;
}

export function needsMfa(error: unknown): boolean
{
    return (error as ApiError | null)?.code === 'pocket.auth.mfa_required';
}

interface IRequestOptions
{
    method?: string;
    body?: unknown;
}

// The caller names what the route answers. It is an assertion and not a validation — nothing here
// parses the payload — so the type is only as true as the C# record it was copied from. That is the
// contract worth stating out loud: `WebApiEndpoints.cs` is its other half.
async function request<T>(path: string, options: IRequestOptions = {}): Promise<T>
{
    let response: Response;

    try
    {
        response = await fetch(path, {
            credentials: 'same-origin',
            headers: options.body ? {'Content-Type': 'application/json'} : undefined,
            method: options.method,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });
    }
    catch (cause)
    {
        // The hotel being down and the hotel refusing you are different screens, so the transport
        // failure keeps its own code rather than collapsing into a generic error.
        throw new ApiError('hotel_unreachable', 0, {cause});
    }

    // The endpoints that answer a bare `{}` parse to something empty-but-fine; a body that is not
    // JSON at all is a proxy or a crash, never the API.
    let payload: unknown;

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
        throw new ApiError((payload as {error?: string} | null)?.error, response.status);
    }

    return payload as T;
}

export function hello(): Promise<{status: string}>
{
    return request('/api/public/info/hello');
}

// The languages the hotel publishes in.
export function getLanguages(): Promise<ISiteLanguages>
{
    return request('/api/public/languages');
}

// Anonymous by design — the front page has to render with no session at all — and the server does
// the ordering: pinned first, then newest. `lang` in the answer is the language actually served,
// which may not be the one asked for; a summary then carries `fallback: true`.
export function getArticles(
    options: {category?: string; page?: number; pageSize?: number} = {}
): Promise<IArticleFeed>
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

// 404 `article_not_found` when there is none. `body` is the stored block array — never HTML. See
// components/ArticleBody.svelte.
export function getArticle(slug: string): Promise<IArticleDetail>
{
    return request(`/api/public/articles/${encodeURIComponent(slug)}`);
}

// 404 `user_not_found`. habbo.com's own two-step: the site routes on /profile/:name and the profile
// read takes the id this hands back.
export function getUser(name: string): Promise<IProfileUser>
{
    return request(`/api/public/users?name=${encodeURIComponent(name)}`);
}

// Anonymous: a profile is a page a signed-out visitor can open. A badge carries its CODE and no
// label — the hotel's badge texts are not in the database, they are `badge_<code>_name` in the asset
// host's external_flash_texts (see lib/badges.ts).
export function getProfile(uniqueId: string): Promise<IPlayerProfile>
{
    return request(`/api/public/users/${encodeURIComponent(uniqueId)}/profile`);
}

// Busiest first. A room whose door is invisible is in neither this nor getRoom(): the web API would
// otherwise walk around the door the client enforces.
export function getRooms(options: {page?: number; pageSize?: number} = {}): Promise<IRoomPage>
{
    const query = new URLSearchParams();

    if(options.page)
    {
        query.set('page', String(options.page));
    }

    if(options.pageSize)
    {
        query.set('pageSize', String(options.pageSize));
    }

    const suffix = query.size ? `?${query}` : '';

    return request(`/api/public/rooms${suffix}`);
}

// 404 `room_not_found` for a room that does not exist OR whose door is invisible.
export function getRoom(id: number | string): Promise<IRoomSummary>
{
    return request(`/api/public/rooms/${encodeURIComponent(id)}`);
}

// The SELECTED avatar's wallet, falling back to the account's first. 401 when signed out.
export function getPurse(): Promise<IPlayerPurse>
{
    return request('/api/user/purse');
}

// A 401 carrying `pocket.auth.mfa_required` is not a refusal, it is the server asking for the second
// factor — see needsMfa().
export function login(email: string, password: string, code?: string): Promise<ILoginResponse>
{
    return request('/api/public/authentication/login', {
        method: 'POST',
        body: {email, password, ...(code ? {code} : {})},
    });
}

// The server logs the new account in as part of the same call, so there is no second round trip and
// the cookie is already set when this resolves.
export function register(
    email: string,
    password: string,
    passwordRepeated: string
): Promise<IRegistrationResponse>
{
    return request('/api/public/registration/new', {
        method: 'POST',
        body: {email, password, passwordRepeated},
    });
}

export function logout(): Promise<IEmptyResponse>
{
    return request('/api/public/authentication/logout', {method: 'POST'});
}

// -> { sessionsRevoked }. Note this ends EVERY session of the account including the caller's: the
// endpoint clears the cookie itself, so the page must return to the landing screen afterwards.
export function changePassword(
    currentPassword: string,
    newPassword: string,
    code?: string
): Promise<IPasswordChangeResponse>
{
    return request('/api/public/authentication/password', {
        method: 'POST',
        body: {currentPassword, newPassword, ...(code ? {code} : {})},
    });
}

export function getAvatars(): Promise<IAvatarInfo[]>
{
    return request('/api/user/avatars');
}

// The refreshed list, same shape as getAvatars().
export function createAvatar(name: string, figure: string, gender: string): Promise<IAvatarInfo[]>
{
    return request('/api/user/avatars', {method: 'POST', body: {name, figure, gender}});
}

// Which avatar the next SSO ticket belongs to. The choice is stored server-side on the session and
// is never read back, so lib/session.ts keeps its own copy for the UI.
export function selectAvatar(uniqueId: string): Promise<IEmptyResponse>
{
    return request('/api/user/avatars/select', {method: 'POST', body: {uniqueId}});
}

// The ticket the client trades for a connection; it is single-use, so /hotel asks for a fresh one on
// every mount.
export function ssoToken(uniqueId?: string): Promise<ISsoTicketResponse>
{
    const query = uniqueId ? `?uniqueId=${encodeURIComponent(uniqueId)}` : '';

    return request(`/api/ssotoken${query}`);
}

export function checkName(name: string): Promise<INameCheckResponse>
{
    return request('/api/newuser/name/check', {method: 'POST', body: {name}});
}

// A name already taken is a **409**, so it arrives here as a thrown ApiError carrying
// `pocket.auth.name_taken` — not, as this comment claimed until the contract was generated, a 200
// with an error in the body. Nothing read it that way, which is how the claim survived.
export function selectName(name: string, playerId: number): Promise<INameSelectResponse>
{
    return request('/api/newuser/name/select', {method: 'POST', body: {name, playerId}});
}

// The sign-in address. `verified` is always false — nothing in this hotel can send to an address,
// so none was ever confirmed, and there is no resend route to call.
export function getEmail(): Promise<IAccountEmail>
{
    return request('/api/user/email');
}

// 409 `email_taken` when another account already signs in with it; 400 for a wrong password, a
// second factor still owed (`pocket.auth.mfa_required`) or an address that is not one.
export function changeEmail(
    currentPassword: string,
    email: string,
    code?: string
): Promise<IAccountEmail>
{
    return request('/api/user/email/change', {
        method: 'POST',
        body: {currentPassword, email, ...(code ? {code} : {})},
    });
}

// The selected avatar's preferences. One field: `profileVisible`. habbo.com's own privacy form
// carries six more and none of them has anywhere to be stored here — see PlayerPreferencesResponse.
export function getPreferences(): Promise<IPlayerPreferences>
{
    return request('/api/user/preferences');
}

export function savePreferences(profileVisible: boolean): Promise<IPlayerPreferences>
{
    return request('/api/user/preferences/save', {method: 'POST', body: {profileVisible}});
}

// The second factor. Enrolment is two calls on purpose: `startTwoFactor` hands out a secret and
// stores nothing, and only `enableTwoFactor` — which needs a code computed from it — writes it. A
// visitor who closes the dialog halfway has therefore not locked themselves out.
export function getTwoFactor(): Promise<ITwoFactorStatus>
{
    return request('/api/user/twofactor');
}

// 409 `pocket.auth.mfa_already_enabled` when one is already enrolled: replacing means disabling
// first, which demands a code from the factor being removed.
export function startTwoFactor(): Promise<ITwoFactorEnrolment>
{
    return request('/api/user/twofactor/startregistration', {method: 'POST'});
}

export function enableTwoFactor(secret: string, code: string): Promise<IEmptyResponse>
{
    return request('/api/user/twofactor/enable', {method: 'POST', body: {secret, code}});
}

export function disableTwoFactor(code: string): Promise<IEmptyResponse>
{
    return request('/api/user/twofactor/disable', {method: 'POST', body: {code}});
}

export function saveLook(
    figureString: string,
    gender: string,
    playerId: number
): Promise<IEmptyResponse>
{
    return request('/api/user/look/save', {method: 'POST', body: {figureString, gender, playerId}});
}
