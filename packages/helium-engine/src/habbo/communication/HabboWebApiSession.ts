/**
 * HabboWebApiSession
 *
 * @see sources/win63_2021_version/com/sulake/habbo/communication/HabboWebApiSession.as
 *
 * Main HTTP session for the Habbo Web API.
 * Implements IHabboWebApiSession and IApiListener.
 *
 * In AS3, uses URLLoader for HTTP requests and describeType() to read
 * [HabboWebApiRoute] metadata annotations for route mapping.
 * In TypeScript, uses the Fetch API and a static WEB_API_ROUTES map.
 */
import {Logger} from '@core/utils/Logger';
import type {IApiListener} from './IApiListener';
import type {IHabboWebApiListener} from './IHabboWebApiListener';
import type {IHabboWebApiSession} from './IHabboWebApiSession';
import {WEB_API_ROUTES} from './IHabboWebApiSession';
import {WebApiRequest} from './WebApiRequest';

const logger = Logger.getLogger('HabboWebApiSession');

export class HabboWebApiSession implements IHabboWebApiSession, IApiListener
{
	/**
	 * AS3: SHARED_SECRET — used for device ID HMAC.
	 * Not needed in browser (no machine ID), but kept for reference.
	 */
	private static readonly SHARED_SECRET = 'CnurvLf7UP';

	private _routes: Map<string, WebApiRequest> = new Map();
	private _server: string;
	private _captchaToken: string | null = null;
	private _listeners: IHabboWebApiListener[] = [];
	private _disposed: boolean = false;
	private _deviceId: string;
	private _deviceToken: string = '';
	private _lastRequest: WebApiRequest | null = null;
	private _lastRequestVars: Record<string, unknown> | null = null;
	private _lastRequestPathParams: (string | number)[] | null = null;
	private _captchaRequiredUri: string | null = null;

	/**
	 * AS3: HabboWebApiSession(server)
	 * Initializes the session, generates device ID, builds route dictionary.
	 *
	 * @param server - Base server URL (e.g., 'https://www.habbo.com')
	 */
	constructor(server: string)
	{
		this._server = server;
		this._deviceId = this.generateDeviceId();

		// AS3: describeType(IHabboWebApiSession) → walk methods with [HabboWebApiRoute]
		// In TypeScript, we use the static WEB_API_ROUTES map.
		for(const [methodName, route] of Object.entries(WEB_API_ROUTES))
		{
			this._routes.set(
				methodName,
				new WebApiRequest(route.uri, route.method, route.requiresSession !== false)
			);
		}
	}

	get disposed(): boolean
	{
		return this._disposed;
	}

	get captchaToken(): string | null
	{
		return this._captchaToken;
	}

	// ── Listener management ─────────────────────────────────────────

	/**
	 * AS3: addListener(listener)
	 */
	public addListener(listener: IHabboWebApiListener): boolean
	{
		if(this._listeners.indexOf(listener) === -1)
		{
			this._listeners.push(listener);

			return true;
		}

		return false;
	}

	/**
	 * AS3: removeListener(listener)
	 */
	public removeListener(listener: IHabboWebApiListener): void
	{
		const index = this._listeners.indexOf(listener);

		if(index !== -1)
		{
			this._listeners.splice(index, 1);
		}
	}

	/**
	 * AS3: setCaptchaToken(token)
	 * Sets the captcha token and re-executes the last failed request if applicable.
	 */
	public setCaptchaToken(token: string): boolean
	{
		this._captchaToken = token;

		if(this._captchaRequiredUri && this._lastRequest && this._lastRequest.uri === this._captchaRequiredUri)
		{
			this._captchaRequiredUri = null;

			this.reExecuteLastRequest();

			return true;
		}

		return false;
	}

	// ── IApiListener callbacks ──────────────────────────────────────

	/**
	 * AS3: apiResponse(uri, data)
	 * Dispatches successful response to all listeners.
	 */
	public apiResponse(uri: string, data: Record<string, unknown>): void
	{
		for(const listener of this._listeners)
		{
			if(!listener.disposed)
			{
				listener.habboWebApiResponse(uri, data);
			}
		}
	}

	/**
	 * AS3: apiRawResponse(uri, data)
	 * Dispatches raw response to all listeners.
	 */
	public apiRawResponse(uri: string, data: unknown): void
	{
		for(const listener of this._listeners)
		{
			if(!listener.disposed)
			{
				listener.habboWebApiRawResponse(uri, data);
			}
		}
	}

	/**
	 * AS3: apiError(uri, status, error, data, isCaptcha)
	 * Normalizes the error and dispatches to all listeners.
	 */
	public apiError(uri: string, status: number, error: string, data: Record<string, unknown> | null, isCaptcha: boolean = false): void
	{
		// AS3: Normalize error from data
		let normalizedError = error;

		if(data)
		{
			if(typeof data.error === 'string')
			{
				normalizedError = data.error;
			}
			else if(Array.isArray(data.errors) && (data.errors as string[]).length > 0)
			{
				normalizedError = (data.errors as string[])[0];
			}
			else if(typeof data.message === 'string')
			{
				normalizedError = data.message;
			}
		}

		// AS3: If captcha-related, store URI for re-execution
		if(isCaptcha || normalizedError === 'invalid-captcha')
		{
			this._captchaRequiredUri = uri;
		}

		for(const listener of this._listeners)
		{
			if(!listener.disposed)
			{
				listener.habboWebApiError(uri, status, normalizedError, data, isCaptcha);
			}
		}
	}

	// ── Request execution ───────────────────────────────────────────

	/**
	 * AS3: executeRequest(methodName, vars, pathParams)
	 * Looks up the route for a method and executes the HTTP request.
	 *
	 * @param methodName - The name of the API method (matches WEB_API_ROUTES key)
	 * @param vars - Request body variables (for POST) or query params (for GET)
	 * @param pathParams - Path parameter substitutions (e.g., :id → value)
	 */
	private executeRequest(
		methodName: string,
		vars: Record<string, unknown> | null = null,
		pathParams: (string | number)[] | null = null
	): void
	{
		const request = this._routes.get(methodName);

		if(!request)
		{
			logger.warn(`Unknown API method: ${methodName}`);

			return;
		}

		this._lastRequest = request;
		this._lastRequestVars = vars;
		this._lastRequestPathParams = pathParams;

		// Resolve path parameters (:id, :roomId, etc.)
		let resolvedUri = request.uri;

		if(pathParams && pathParams.length > 0)
		{
			let paramIndex = 0;

			resolvedUri = resolvedUri.replace(/:(\w+)/g, () =>
			{
				if(paramIndex < pathParams.length)
				{
					return String(pathParams[paramIndex++]);
				}

				return '';
			});
		}

		// Build URL
		let url = this.getURL(resolvedUri);

		// Build headers
		const headers: Record<string, string> = {};

		this.addHeaders(headers);

		// Build body
		let body: string | null = null;

		if(request.requestMethod === 'GET')
		{
			// Append query string for GET requests
			if(vars && Object.keys(vars).length > 0)
			{
				const params = new URLSearchParams();

				for(const [key, value] of Object.entries(vars))
				{
					params.set(key, String(value));
				}

				url += '?' + params.toString();
			}
		}
		else
		{
			// JSON body for non-GET requests
			headers['Content-Type'] = 'application/json';

			// Append captcha token if present
			if(this._captchaToken)
			{
				if(!vars) vars = {};

				vars['captchaToken'] = this._captchaToken;
			}

			body = vars ? JSON.stringify(vars) : '{}';
		}

		request.makeRequest(this, url, headers, body);
	}

	/**
	 * Re-executes the last request (after captcha token is set).
	 */
	private reExecuteLastRequest(): void
	{
		if(!this._lastRequest) return;

		// Find the method name for this request
		for(const [name, req] of this._routes.entries())
		{
			if(req.uri === this._lastRequest.uri)
			{
				this.executeRequest(name, this._lastRequestVars, this._lastRequestPathParams);

				return;
			}
		}
	}

	/**
	 * AS3: getURL(path)
	 */
	private getURL(path: string): string
	{
		return this._server + path;
	}

	/**
	 * AS3: addHeaders(request)
	 * Adds device ID and type headers to the request.
	 */
	private addHeaders(headers: Record<string, string>): void
	{
		headers['X-Habbo-Device-ID'] = this._deviceId;
		headers['x-habbo-api-deviceid'] = this._deviceId;
		headers['X-Habbo-Device-Type'] = 'web';
	}

	/**
	 * AS3: generateDeviceId(machineId)
	 * Generates a random device ID. In AS3, this was SHA1(SHARED_SECRET + machineId).
	 * In the browser, we use crypto.randomUUID() or a random hex string.
	 */
	private generateDeviceId(): string
	{
		if(typeof crypto !== 'undefined' && crypto.randomUUID)
		{
			return crypto.randomUUID();
		}

		// Fallback: random hex string
		return Array.from({ length: 32 }, () =>
			Math.floor(Math.random() * 16).toString(16)
		).join('');
	}

	// ── IHabboWebApiSession API methods ─────────────────────────────
	// Each method delegates to executeRequest() with the method name.

	public emailChange(newEmail: string): void
	{
		this.executeRequest('emailChange', { newEmail });
	}

	public passwordChange(newPassword: string): void
	{
		this.executeRequest('passwordChange', { newPassword });
	}

	public tosAccept(): void
	{
		this.executeRequest('tosAccept');
	}

	public captcha(): void
	{
		this.executeRequest('captcha');
	}

	public achievements(): void
	{
		this.executeRequest('achievements');
	}

	public achievementsForId(id: number): void
	{
		this.executeRequest('achievementsForId', null, [id]);
	}

	public time(): void
	{
		this.executeRequest('time');
	}

	public activate(token: string): void
	{
		this.executeRequest('activate', { token });
	}

	public login(email: string, password: string): void
	{
		this.executeRequest('login', { email, password });
	}

	public facebook(accessToken: string): void
	{
		this.executeRequest('facebook', { accessToken });
	}

	public rpx(token: string): void
	{
		this.executeRequest('rpx', { token });
	}

	public logout(): void
	{
		this.executeRequest('logout');
	}

	public authenticateUser(): void
	{
		this.executeRequest('authenticateUser');
	}

	public forgotPassword(email: string): void
	{
		this.executeRequest('forgotPassword', { email });
	}

	public changePassword(token: string, password: string, answer1: string, answer2: string): void
	{
		this.executeRequest('changePassword', { token, password, answer1, answer2 });
	}

	public groups(id: number): void
	{
		this.executeRequest('groups', null, [id]);
	}

	public members(id: number): void
	{
		this.executeRequest('members', null, [id]);
	}

	public hello(): void
	{
		this.executeRequest('hello');
	}

	public register(email: string, password: string, day: number, month: number, year: number, tos: boolean, captchaToken: string): void
	{
		this._captchaToken = captchaToken;

		this.executeRequest('register', {
			email,
			password,
			birthdate: { day, month, year },
			tos,
			captchaToken,
		});
	}

	public popularRooms(): void
	{
		this.executeRequest('popularRooms');
	}

	public room(id: number): void
	{
		this.executeRequest('room', null, [id]);
	}

	public hotlooks(): void
	{
		this.executeRequest('hotlooks');
	}

	public logCrash(message: string): void
	{
		this.executeRequest('logCrash', { message });
	}

	public logError(message: string): void
	{
		this.executeRequest('logError', { message });
	}

	public logLoginStep(step: string, extra: string): void
	{
		this.executeRequest('logLoginStep', { step, extra });
	}

	public clientUrl(): void
	{
		this.executeRequest('clientUrl');
	}

	public nameCheck(name: string): void
	{
		this.executeRequest('nameCheck', { name });
	}

	public selectUser(name: string): void
	{
		this.executeRequest('selectUser', { name });
	}

	public selectRoom(roomIndex: number): void
	{
		this.executeRequest('selectRoom', { roomIndex });
	}

	public safetyLockStatus(): void
	{
		this.executeRequest('safetyLockStatus');
	}

	public safetyLockDisable(): void
	{
		this.executeRequest('safetyLockDisable');
	}

	public resetTrustedLogins(): void
	{
		this.executeRequest('resetTrustedLogins');
	}

	public safetyLockSave(password: string, q1Id: number, a1: string, q2Id: number, a2: string): void
	{
		this.executeRequest('safetyLockSave', { password, questionId1: q1Id, answer1: a1, questionId2: q2Id, answer2: a2 });
	}

	public safetyLockQuestions(): void
	{
		this.executeRequest('safetyLockQuestions');
	}

	public safetyLockUnlock(answer1: string, answer2: string, trustDevice: boolean): void
	{
		this.executeRequest('safetyLockUnlock', { answer1, answer2, trustDevice });
	}

	public commonFriends(id: number): void
	{
		this.executeRequest('commonFriends', null, [id]);
	}

	public preferences(): void
	{
		this.executeRequest('preferences');
	}

	public self(): void
	{
		this.executeRequest('self');
	}

	public ping(): void
	{
		this.executeRequest('ping');
	}

	public saveUser(): void
	{
		this.executeRequest('saveUser');
	}

	public saveVisibility(visible: boolean): void
	{
		this.executeRequest('saveVisibility', { visible });
	}

	public campaignMessages(): void
	{
		this.executeRequest('campaignMessages');
	}

	public campaignMessagesAll(): void
	{
		this.executeRequest('campaignMessagesAll');
	}

	public campaignMessagesSeen(): void
	{
		this.executeRequest('campaignMessagesSeen');
	}

	public discussions(): void
	{
		this.executeRequest('discussions');
	}

	public creditBalance(): void
	{
		this.executeRequest('creditBalance');
	}

	public friendRequestsSent(): void
	{
		this.executeRequest('friendRequestsSent');
	}

	public friendRequestsReceived(): void
	{
		this.executeRequest('friendRequestsReceived');
	}

	public saveLooks(figure: string, gender: string): void
	{
		this.executeRequest('saveLooks', { figure, gender });
	}

	public avatars(): void
	{
		this.executeRequest('avatars');
	}

	public selectAvatar(uniqueId: string): void
	{
		this.executeRequest('selectAvatar', { uniqueId });
	}

	public changeEmail(newEmail: string, currentPassword: string): void
	{
		this.executeRequest('changeEmail', { newEmail, currentPassword });
	}

	public createAvatar(name: string): void
	{
		this.executeRequest('createAvatar', { name });
	}

	public profile(): void
	{
		this.executeRequest('profile');
	}

	public ssoToken(): void
	{
		this.executeRequest('ssoToken');
	}

	public validateItunesIAP(transactionId: string, receipt: string, centPrice: number, priceLocale: string): void
	{
		this.executeRequest('validateItunesIAP', { transactionId, receipt, centPrice, priceLocale });
	}

	public validatePlaystoreIAP(transactionId: string, receipt: string, centPrice: number, priceLocale: string, signature: string): void
	{
		this.executeRequest('validatePlaystoreIAP', { transactionId, receipt, centPrice, priceLocale, signature });
	}

	public setDeviceToken(token: string): void
	{
		this._deviceToken = token;
		this.executeRequest('setDeviceToken', { token });
	}

	public getDeviceToken(): string
	{
		return this._deviceToken;
	}

	// ── Dispose ─────────────────────────────────────────────────────

	public dispose(): void
	{
		if(this._disposed) return;

		this._disposed = true;

		// Dispose all requests
		for(const request of this._routes.values())
		{
			request.dispose();
		}

		this._routes.clear();
		this._listeners.length = 0;
		this._lastRequest = null;
		this._lastRequestVars = null;
		this._lastRequestPathParams = null;
	}
}
