/**
 * WebApiLoginProvider
 *
 * @see sources/win63_2021_version/com/sulake/habbo/communication/login/WebApiLoginProvider.as
 * @see sources/win63_2021_version/com/sulake/habbo/communication/HabboWebApiSession.as
 *
 * fetch()-based REST API client for the Habbo login endpoints.
 * Port of AS3's WebApiLoginProvider + HabboWebApiSession using the Fetch API.
 *
 * API endpoints (from AS3 HabboWebApiRoute annotations):
 * - GET /api/public/info/hello — Server status check
 * - POST /api/public/authentication/login — Email/password login
 * - GET /api/user/avatars — List user's avatars
 * - POST /api/user/avatars/select — Select avatar by uniqueId
 * - GET /api/ssotoken — Get SSO token for WebSocket
 */
import {EventEmitter} from 'eventemitter3';
import type {IHabboCommunicationManager} from '../IHabboCommunicationManager';
import type {ILoginViewer} from './ILoginViewer';
import type {ILoginProvider} from './ILoginProvider';
import {AvatarData} from './AvatarData';

export class WebApiLoginProvider extends EventEmitter implements ILoginProvider
{
    public static readonly SSO_TOKEN_AVAILABLE = 'SSO_TOKEN_AVAILABLE';

    private _viewer: ILoginViewer;
    private _communication: IHabboCommunicationManager | null = null;
    private _serverUrl: string = '';
    private _deviceId: string;

    constructor(viewer: ILoginViewer)
    {
        super();
        this._viewer = viewer;
        this._deviceId = this.generateDeviceId();
    }

    private _ssoToken: string | null = null;

    get ssoToken(): string | null
    {
        return this._ssoToken;
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * AS3: init(communication)
	 * Initialize the provider with the communication manager.
	 * In AS3, this calls communication.getHabboWebApiSession() to get the HTTP session.
	 * In our port, we use fetch() directly but store the communication reference.
	 */
    public init(communication?: IHabboCommunicationManager | null): void
    {
        if(communication)
        {
            this._communication = communication;
        }

        const webApiUrl = this._viewer.getProperty('web.api');

        if(webApiUrl)
        {
            this._serverUrl = webApiUrl;
        }
        else
        {
            // Fallback: use url.prefix with https
            const urlPrefix = this._viewer.getProperty('url.prefix');

            if(urlPrefix)
            {
                this._serverUrl = urlPrefix.replace('http://', 'https://');
            }
        }

        // AS3: initHabboWebApiSession → session.hello()
        this.hello();
    }

    /**
	 * AS3: loginWithCredentials()
	 * Login with email and password via the Web API.
	 *
	 * @param email - User email
	 * @param password - User password
	 */
    public loginWithCredentials(email: string, password: string): void
    {
        this.executeRequest('/api/public/authentication/login', 'POST', { email, password });
    }

    /**
	 * AS3: loginWithCredentialsWeb()
	 * Select an avatar by its unique ID after successful login.
	 *
	 * @param uniqueId - Avatar unique ID
	 */
    public loginWithCredentialsWeb(uniqueId: string): void
    {
        this.executeRequest('/api/user/avatars/select', 'POST', { uniqueId });
    }

    /**
	 * AS3: session.selectAvatar()
	 * Select an avatar — POST /api/user/avatars/select
	 */
    public selectAvatarUniqueid(uniqueId: string): void
    {
        this.executeRequest('/api/user/avatars/select', 'POST', { uniqueId });
    }

    /**
	 * AS3: register() → session.register(email, password, day, month, year, termsOfServiceAccepted, captchaToken)
	 * Register a new account — POST /api/public/registration/new
	 */
    public register(email: string, password: string): void
    {
        this.executeRequest('/api/public/registration/new', 'POST', {
            email,
            password,
            passwordRepeated: password,
            birthdate: { day: 0, month: 0, year: 0 },
            termsOfServiceAccepted: true,
        });
    }

    /**
	 * AS3: createAvatar() → session.createAvatar(name, figure, gender)
	 * Create an avatar for the current account — POST /api/user/avatars
	 */
    public createAvatar(name: string, figure: string, gender: string): void
    {
        const body: Record<string, unknown> = { name, gender };

        if(figure && figure.length > 0)
        {
            body.figure = figure;
        }

        this.executeRequest('/api/user/avatars', 'POST', body);
    }

    /**
	 * AS3: checkName() → session.nameCheck(name)
	 * Check avatar name availability — POST /api/newuser/name/check
	 */
    public checkName(name: string): void
    {
        this.executeRequest('/api/newuser/name/check', 'POST', { name });
    }

    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._communication = null;
        this.removeAllListeners();
    }

    /**
	 * AS3: hello()
	 * Server hello/status check — GET /api/public/info/hello
	 */
    private hello(): void
    {
        this.executeRequest('/api/public/info/hello', 'GET');
    }

    /**
	 * AS3: fetchAvatars() → session.avatars()
	 * Fetch the user's avatar list — GET /api/user/avatars
	 */
    private fetchAvatars(): void
    {
        this.executeRequest('/api/user/avatars', 'GET');
    }

    /**
	 * AS3: session.ssoToken()
	 * Request an SSO token — GET /api/ssotoken
	 */
    private requestSsoToken(): void
    {
        this.executeRequest('/api/ssotoken', 'GET');
    }

    /**
	 * Generates a random device ID (replaces AS3's machine ID + SHA1 hash).
	 */
    private generateDeviceId(): string
    {
        const hex = Array.from({ length: 32 }, () =>
            Math.floor(Math.random() * 16).toString(16)
        ).join('');

        return hex;
    }

    /**
	 * Execute an HTTP request to the Web API.
	 * Replaces AS3's HabboWebApiSession.executeRequest().
	 *
	 * @param path - API path (e.g., '/api/public/info/hello')
	 * @param method - HTTP method ('GET' or 'POST')
	 * @param body - Request body for POST requests
	 */
    private async executeRequest(path: string, method: string, body?: Record<string, unknown>): Promise<void>
    {
        const url = this._serverUrl + path;

        const headers: Record<string, string> = {
            'X-Habbo-Device-ID': this._deviceId,
            'x-habbo-api-deviceid': this._deviceId,
        };

        const options: RequestInit = {
            method,
            headers,
            credentials: 'include',
        };

        if(method === 'POST')
        {
            headers['Content-Type'] = 'application/json';
            options.body = body ? JSON.stringify(body) : '{}';
        }

        try
        {
            const response = await fetch(url, options);

            if(response.ok)
            {
                const data = await response.json().catch(() => ({}));

                this.handleResponse(path, data);
            }
            else
            {
                let errorData: Record<string, unknown>;

                try
                {
                    errorData = await response.json();
                }
                catch
                {
                    errorData = { error: response.statusText };
                }

                this.handleError(path, response.status, errorData);
            }
        }
        catch (error)
        {
            // Network error (CORS, connection refused, etc.)
            this.handleError(path, 0, { error: 'ioError' });
        }
    }

    /**
	 * AS3: habboWebApiResponse()
	 * Routes successful API responses to the appropriate handler.
	 */
    private handleResponse(path: string, data: Record<string, unknown>): void
    {
        // AS3: Check for force array (TOS, EMAIL, PASSWORD)
        if(data.force && Array.isArray(data.force))
        {
            const forces = data.force as string[];

            if(forces.includes('TOS'))
            {
                this._viewer.showErrorMessage('Terms of Service must be accepted');

                return;
            }

            if(forces.includes('EMAIL') || forces.includes('PASSWORD'))
            {
                this._viewer.showErrorMessage('Account issue — please check your credentials');

                return;
            }
        }

        switch(path)
        {
            case '/api/public/info/hello':
                // AS3: if _autoLogin, request SSO token; else environmentReady()
                this._viewer.environmentReady();
                break;

            case '/api/public/authentication/login':
                // Login successful — fetch avatar list
                this.fetchAvatars();
                break;

            case '/api/user/avatars':
            {
                // Parse avatar list
                const avatarList = this.parseAvatarList(data);

                if(avatarList.length === 1)
                {
                    // AS3: Single avatar — auto-select
                    this.selectAvatarUniqueid(avatarList[0].uniqueId);
                }
                else if(avatarList.length > 1)
                {
                    // AS3: Multiple avatars — show selection screen
                    this._viewer.populateCharacterList(avatarList);
                }
                else
                {
                    this._viewer.showErrorMessage('No avatars found on this account');
                }

                break;
            }

            case '/api/user/avatars/select':
                // Avatar selected — request SSO token
                this.requestSsoToken();
                break;

            case '/api/ssotoken':
            {
                // SSO token received — dispatch event
                const token = (data.ssoToken as string) ?? (data.sso_token as string) ?? null;

                if(token)
                {
                    this._ssoToken = token;
                    this.emit(WebApiLoginProvider.SSO_TOKEN_AVAILABLE, token);
                }
                else
                {
                    this._viewer.showErrorMessage('Failed to obtain SSO token');
                }

                break;
            }

            case '/api/public/registration/new':
                // AS3: showSelectAvatar(response) — routes to the avatar creation screen
                this._viewer.showSelectAvatar(data);
                break;

            case '/api/newuser/name/check':
                // AS3: nameCheckResponse(response, path == "/api/newuser/name/check")
                this._viewer.nameCheckResponse(data, true);
                break;
        }
    }

    /**
	 * AS3: habboWebApiError()
	 * Routes API errors to the appropriate error handler.
	 */
    private handleError(path: string, statusCode: number, data: Record<string, unknown>): void
    {
        // AS3: habboWebApiError() routes name-check failures back through nameCheckResponse()
        // instead of the generic error balloon, so the AvatarCreate screen can show an
        // inline "name taken" message.
        if(path === '/api/newuser/name/check')
        {
            this._viewer.nameCheckResponse(data, true);

            return;
        }

        // Extract error message from response
        let errorMessage = 'Unknown error';

        if(data.errors && Array.isArray(data.errors) && (data.errors as string[]).length > 0)
        {
            errorMessage = (data.errors as string[])[0];
        }
        else if(data.error)
        {
            errorMessage = data.error as string;
        }
        else if(data.message)
        {
            errorMessage = data.message as string;
        }

        // Map error codes to user-friendly messages (AS3 showError)
        switch(errorMessage)
        {
            case 'login.user_banned':
                this._viewer.showErrorMessage('Your account has been banned.');
                break;

            case 'login.blocked':
                this._viewer.showErrorMessage('Too many login attempts. Please try again later.');
                break;

            case 'pocket.auth.login_failed':
                this._viewer.showErrorMessage('Login failed. Please check your credentials.');
                break;

            case 'pocket.auth.no_avatars':
                this._viewer.showErrorMessage('No avatars found on this account.');
                break;

            case 'pocket.auth.valid_email_required':
            case 'pocket.auth.password_required':
                this._viewer.showErrorMessage('Please enter valid credentials.');
                break;

            case 'ioError':
                this._viewer.showErrorMessage('Connection error. Please check the server URL.');
                break;

            case 'invalid-captcha':
                this._viewer.showErrorMessage('Captcha verification failed.');
                break;

            default:
                this._viewer.showErrorMessage(errorMessage || `Error ${statusCode}`);
                break;
        }
    }

    /**
	 * Parses the avatar list from the API response.
	 * AS3 response format: array of objects with uniqueId, name, motto, figureString, etc.
	 */
    private parseAvatarList(data: Record<string, unknown>): AvatarData[]
    {
        const result: AvatarData[] = [];

        // The response can be an array directly or nested under a property
        let avatarArray: Record<string, unknown>[] = [];

        if(Array.isArray(data))
        {
            avatarArray = data as Record<string, unknown>[];
        }
        else if(Array.isArray(data.avatars))
        {
            avatarArray = data.avatars as Record<string, unknown>[];
        }
        else if(Array.isArray(data.data))
        {
            avatarArray = data.data as Record<string, unknown>[];
        }
        else if(typeof data.uniqueId === 'string')
        {
            // POST /api/user/avatars (createAvatar) may return the created avatar as a
            // single object rather than wrapped in an array.
            avatarArray = [data];
        }

        for(const item of avatarArray)
        {
            result.push(new AvatarData(item));
        }

        return result;
    }
}
