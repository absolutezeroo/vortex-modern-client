/**
 * LoginFlow
 *
 * @see sources/win63_2021_version/login/LoginFlow.as
 *
 * Main orchestrator for the login flow.
 * Implements ILoginContext (views call into) and ILoginViewer (provider calls back).
 * Creates all 4 screens: SSO Token (default), Environment, Login, Avatar.
 * When complete, dispatches LOGIN_FLOW_FINISHED_EVENT with the SSO token.
 *
 * Like AS3's LoginFlow (a standalone Sprite not part of the window hierarchy),
 * this is a DOM-based overlay that runs independently of the main canvas.
 *
 * AS3 pattern: constructor calls createFakeContext() which creates:
 * - createConfiguration() -> HabboConfigurationManager
 * - createLocalization() -> HabboLocalizationManager
 * - createCommunication() -> HabboCommunicationManager
 * - WebApiLoginProvider(this)
 *
 * AS3 properties:
 * - _background: Background
 * - _SafeStr_4559: Sprite (view container)
 * - _SafeStr_4560: EnvironmentView
 * - _SafeStr_596: LoginView
 * - _SafeStr_4561: SsoTokenView
 * - _SafeStr_4562: AvatarView
 * - _SafeStr_4563: IContext (FakeContext)
 * - _errorBalloon: Sprite
 * - _SafeStr_4564: Sprite (main container)
 * - _SafeStr_4565: Sprite (logo area)
 * - _configuration: HabboConfigurationManager
 * - _communication: HabboCommunicationManager
 * - _localization: HabboLocalizationManager
 * - _SafeStr_597: ILoginProvider
 * - _ssoToken: String
 * - _closeButton: ColouredButton("red", "X")
 * - _SafeStr_4566: Loader (left side image)
 * - _SafeStr_4567: Loader (right side image)
 */
import {EventEmitter} from 'eventemitter3';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import {HabboCommunicationManager} from '@habbo/communication/HabboCommunicationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import {HabboLocalizationManager} from '@habbo/localization/HabboLocalizationManager';
import {Logger} from '@core/utils/Logger';
import type {ILoginViewer} from '@habbo/communication/login/ILoginViewer';
import type {ILoginProvider} from '@habbo/communication/login/ILoginProvider';
import {WebApiLoginProvider} from '@habbo/communication/login/WebApiLoginProvider';
import type {AvatarData} from '@habbo/communication/login/AvatarData';
import {FakeContext} from './FakeContext';
import type {ILoginContext} from './ILoginContext';
import {Background} from './Background';
import {SsoTokenView} from './SsoTokenView';
import {EnvironmentView} from './EnvironmentView';
import {LoginView} from './LoginView';
import {AvatarView} from './AvatarView';
import {ImageLoader} from './ImageLoader';
import type {ImageLoaderEvent} from './ImageLoaderEvent';

// Import logo
import habboLogoUrl from '../assets/images/habbo_logo.png';

const log = Logger.getLogger('LoginFlow');

/**
 * AS3 constants.
 *
 * @see sources/win63_2021_version/login/LoginFlow.as lines 41-48
 */
const LOGO_AREA_HEIGHT = 50;
const MAIN_AREA_MARGIN = 5;

export class LoginFlow implements ILoginContext, ILoginViewer
{
	static readonly LOGIN_FLOW_FINISHED_EVENT = 'LOGIN_FLOW_FINISHED_EVENT';
	static readonly SCREEN_ENVIRONMENT = 1;
	static readonly SCREEN_LOGIN = 2;
	static readonly SCREEN_AVATARS = 3;
	static readonly SCREEN_SSO_TOKEN = 4;

	private _events: EventEmitter = new EventEmitter();

	/** AS3: _SafeStr_4563 — FakeContext (stub IContext for standalone managers) */
	private _fakeContext: FakeContext | null = null;

	/** AS3: _configuration — HabboConfigurationManager */
	private _configuration: IHabboConfigurationManager;

	/** AS3: _localization — HabboLocalizationManager */
	private _localization: IHabboLocalizationManager | null = null;

	/** AS3: _communication — HabboCommunicationManager */
	private _communication: IHabboCommunicationManager | null = null;

	/** AS3: _SafeStr_597 — WebApiLoginProvider (ILoginProvider) */
	private _provider: ILoginProvider;

	/** AS3: _background */
	private _background: Background | null = null;

	/** AS3: _SafeStr_4560 */
	private _environmentView: EnvironmentView | null = null;

	/** AS3: _SafeStr_596 */
	private _loginView: LoginView | null = null;

	/** AS3: _SafeStr_4561 */
	private _ssoTokenView: SsoTokenView | null = null;

	/** AS3: _SafeStr_4562 */
	private _avatarView: AvatarView | null = null;

	private _root: HTMLDivElement | null = null;

	/** AS3: _SafeStr_4564 — main container */
	private _mainContainer: HTMLDivElement | null = null;

	/** AS3: _SafeStr_4559 — view container */
	private _viewContainer: HTMLDivElement | null = null;

	/** AS3: _SafeStr_4565 — logo area */
	private _logoArea: HTMLDivElement | null = null;

	private _errorBalloon: HTMLDivElement | null = null;
	private _errorTimer: number = 0;

	/** AS3: _closeButton — ColouredButton("red", "X") */
	private _closeButton: HTMLButtonElement | null = null;

	/** AS3: _SafeStr_4566 — left side image (Loader) */
	private _SafeStr_4566: HTMLImageElement | null = null;

	/** AS3: _SafeStr_4567 — right side image (Loader) */
	private _SafeStr_4567: HTMLImageElement | null = null;

	private _ssoToken: string | null = null;
	private _disposed: boolean = false;

	/**
	 * AS3: LoginFlow(_arg_1:Dictionary)
	 * Constructor calls createFakeContext() which sets up all managers and the provider.
	 */
	constructor(configurationManager: IHabboConfigurationManager)
	{
		this._configuration = configurationManager;

		// AS3: createFakeContext(_arg_1)
		this.createFakeContext();
	}

	get ssoToken(): string | null
	{
		return this._ssoToken;
	}

	get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * EventEmitter for login flow events.
	 * Listen for LOGIN_FLOW_FINISHED_EVENT.
	 */
	get loginEvents(): EventEmitter
	{
		return this._events;
	}

	/**
	 * AS3: initLogin(_arg_1:String, _arg_2:String)
	 * Delegates to WebApiLoginProvider.
	 */
	public initLogin(email: string, password: string): void
	{
		this._provider.loginWithCredentials(email, password);
	}

	/**
	 * AS3: initLoginWithSsoToken(_arg_1:String, _arg_2:String)
	 * Direct SSO token login — skips Web API entirely.
	 */
	public initLoginWithSsoToken(envId: string, token: string): void
	{
		if(envId && envId.length > 0)
		{
			this.updateEnvironment(envId, false);
		}

		this._ssoToken = token;
		this._events.emit(LoginFlow.LOGIN_FLOW_FINISHED_EVENT);
	}

	/**
	 * AS3: loginWithAvatar(_arg_1:AvatarData)
	 * Delegates avatar selection to WebApiLoginProvider.
	 */
	public loginWithAvatar(avatar: AvatarData): void
	{
		this._provider.loginWithCredentialsWeb(avatar.uniqueId);
	}

	/**
	 * AS3: showScreen(_arg_1:int)
	 * Switches between login screens.
	 */
	public showScreen(screen: number): void
	{
		this.hideViews();

		switch(screen)
		{
			case LoginFlow.SCREEN_ENVIRONMENT:
				if(this._environmentView && this._viewContainer)
				{
					this._viewContainer.appendChild(this._environmentView.element);
					this._environmentView.init();
				}
				break;

			case LoginFlow.SCREEN_LOGIN:
				if(this._loginView && this._viewContainer)
				{
					this._viewContainer.appendChild(this._loginView.element);
					this._loginView.init();

					// AS3: _SafeStr_597.init(_communication)
					this._provider.init(this._communication);
					this._loginView.focus();
				}
				break;

			case LoginFlow.SCREEN_SSO_TOKEN:
				if(this._ssoTokenView && this._viewContainer)
				{
					this._viewContainer.appendChild(this._ssoTokenView.element);
					this._ssoTokenView.init();
					this._ssoTokenView.focus();
				}
				break;

			case LoginFlow.SCREEN_AVATARS:
				if(this._avatarView && this._viewContainer)
				{
					this._viewContainer.appendChild(this._avatarView.element);
					this._avatarView.init();
					this._avatarView.baseUrl = this.getProperty('web.api') ?? '';
				}

				this.layoutMainElements();
				break;
		}

		this.layoutMainElements();
	}

	/**
	 * AS3: updateEnvironment(_arg_1:String, _arg_2:Boolean)
	 *
	 * @see sources/win63_2021_version/login/LoginFlow.as lines 561-578
	 */
	public updateEnvironment(envId: string, previewOnly: boolean): void
	{
		// AS3: previewOnly=true -> only reload localization
		if(previewOnly)
		{
			if(this._localization)
			{
				this._localization.loadDefaultEmbedLocalizations(envId);
			}

			return;
		}

		// AS3: CommunicationUtils.writeSOLProperty("environment", envId)
		// (No SOL equivalent — skipped)

		// AS3: _configuration.updateEnvironmentId(envId)
		if(this._configuration && typeof (this._configuration as any).updateEnvironmentId === 'function')
		{
			(this._configuration as any).updateEnvironmentId(envId);
		}

		if(this._environmentView)
		{
			this._environmentView.updateEnvironment();
		}

		// AS3: _localization.loadDefaultEmbedLocalizations(_configuration.getProperty("environment.id"))
		if(this._localization)
		{
			const currentEnvId = this.getProperty('environment.id') ?? envId;

			this._localization.loadDefaultEmbedLocalizations(currentEnvId);
		}

		log.info(`Updated environment to: ${envId}`);

		// AS3: _communication.updateHostParameters()
		if(this._communication)
		{
			this._communication.updateHostParameters();
		}

		// AS3: _localization.requestLocalizationInit()
		if(this._localization)
		{
			this._localization.requestLocalizationInit();
		}
	}

	/**
	 * AS3: getProperty(_arg_1:String, _arg_2:Dictionary=null):String
	 * Delegates to the configuration manager.
	 */
	public getProperty(key: string): string | null
	{
		try
		{
			const value = this._configuration.getProperty(key);

			return value && value.length > 0 ? value : null;
		}
		catch
		{
			return null;
		}
	}

	/**
	 * AS3: environmentReady()
	 * Called when /api/public/info/hello succeeds — enables login button.
	 */
	public environmentReady(): void
	{
		if(this._loginView)
		{
			this._loginView.ready();
		}
	}

	/**
	 * AS3: populateCharacterList(_arg_1:Vector.<AvatarData>)
	 * Called when multiple avatars need selection.
	 */
	public populateCharacterList(avatars: AvatarData[]): void
	{
		this.showScreen(LoginFlow.SCREEN_AVATARS);

		if(this._avatarView)
		{
			this._avatarView.populateAvatars(avatars);
		}
	}

	/**
	 * AS3: showErrorMessage(_arg_1:String)
	 * Displays a temporary error balloon.
	 */
	public showErrorMessage(message: string): void
	{
		if(!this._mainContainer) return;

		// Clear previous timer
		if(this._errorTimer)
		{
			clearTimeout(this._errorTimer);
			this._errorTimer = 0;
		}

		// Create or reuse error balloon
		if(!this._errorBalloon)
		{
			this._errorBalloon = document.createElement('div');
			Object.assign(this._errorBalloon.style, {
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				background: 'rgba(0, 0, 0, 0.85)',
				color: '#FF5252',
				padding: '16px 24px',
				borderRadius: '8px',
				fontSize: '16px',
				fontFamily: "'Ubuntu', Arial, Helvetica, sans-serif",
				zIndex: '100',
				maxWidth: '400px',
				textAlign: 'center',
				boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
			} as Partial<CSSStyleDeclaration>);
			this._mainContainer.appendChild(this._errorBalloon);
		}

		this._errorBalloon.textContent = message;
		this._errorBalloon.style.display = '';

		// AS3: Timer(3000, 1) -> hide after 3 seconds
		this._errorTimer = window.setTimeout(() =>
		{
			if(this._errorBalloon)
			{
				this._errorBalloon.style.display = 'none';
			}
		}, 3000);
	}

	/**
	 * AS3: showRegistrationError(_arg_1:Object)
	 */
	public showRegistrationError(error: any): void
	{
		this.showError(error);
	}

	/**
	 * AS3: showInvalidLoginError(_arg_1:Object)
	 */
	public showInvalidLoginError(error: any): void
	{
		this.showError(error);
	}

	/**
	 * AS3: showAccountError(_arg_1:Object)
	 */
	public showAccountError(error: any): void
	{
		this.showError(error);
	}

	/**
	 * AS3: saveLooksError(_arg_1:Object)
	 */
	public saveLooksError(error: any): void
	{
		this.showError(error);
	}

	/**
	 * AS3: showTOS()
	 */
	public showTOS(): void
	{
		this.showErrorMessage('Need to show TOS');
	}

	/**
	 * AS3: showCaptchaError()
	 */
	public showCaptchaError(): void
	{
		this.showScreen(2);
		this.showErrorMessage('Error with captcha');
	}

	/**
	 * AS3: showError(_arg_1:Object)
	 * Maps error codes to localization keys and displays the error.
	 *
	 * @see sources/win63_2021_version/login/LoginFlow.as lines 461-527
	 */
	private showError(error: any): void
	{
		let errorCode = '';

		const errors: string[] | undefined = error?.errors;

		errorCode = (errors && errors.length > 0) ? errors[0] : '';

		if(errorCode === '' && error != null)
		{
			if(error.error != null)
			{
				errorCode = error.error;
			}
			else if(error.message != null)
			{
				errorCode = error.message;
			}
		}

		let locKey = '';

		switch(errorCode)
		{
			case 'invalid-captcha':
				this.showCaptchaError();
				return;

			case 'login.user_banned':
				locKey = 'connection.login.error.banned.desc';
				break;

			case 'login.blocked':
				locKey = 'connection.login.error.blocked.desc';
				break;

			case 'unauthorized-staff-login':
				locKey = 'connection.login.error.unauthorized.staff';
				break;

			case 'pocket.auth.login_failed':
				locKey = 'connection.login.error.-3.desc';
				break;

			case 'pocket.auth.no_avatars':
				locKey = 'connection.login.missing_avatars';
				break;

			case 'pocket.auth.valid_email_required':
				locKey = 'connection.login.missing_credentials';
				break;

			case 'pocket.auth.password_required':
				locKey = 'connection.login.missing_credentials';
				break;

			case 'pocket.auth.facebook_disabled':
				locKey = 'connection.login.error.facebook_disabled.desc';
				break;

			case 'pocket.auth.facebook_not_connected':
				break;

			case 'pocket.auth.access_token_required':
				locKey = 'connection.login.error.facebook_accesstoken.desc';
				break;

			case 'ioError':
				locKey = 'connection.login.error.-400.desc';
				break;

			case 'account_issue':
				locKey = 'generic.error';
				break;

			default:
				locKey = 'generic.error';
				break;
		}

		if(locKey && locKey.length > 0)
		{
			// AS3: showErrorMessage(_localization.getLocalization(_local_3))
			let message = locKey;

			if(this._localization)
			{
				const localized = (this._localization as any).getLocalization?.(locKey);

				if(localized) message = localized;
			}

			this.showErrorMessage(message);
		}
	}

	/**
	 * AS3: editorFinished()
	 * Dispatches LOGIN_FLOW_FINISHED_EVENT.
	 */
	public editorFinished(): void
	{
		this._events.emit(LoginFlow.LOGIN_FLOW_FINISHED_EVENT);
	}

	/**
	 * AS3: createCaptchaView():ICaptchaView
	 * Stub — WebCaptchaView is not ported yet.
	 * In AS3: addChild(_closeButton); var _local_1 = new WebCaptchaView(...)
	 */
	public createCaptchaView(): any
	{
		// Show close button
		if(this._closeButton && this._root)
		{
			this._root.appendChild(this._closeButton);
		}

		this.layoutMainElements();

		// Stub: WebCaptchaView not yet implemented
		return null;
	}

	/**
	 * AS3: captchaReady()
	 * Removes the captcha and close button, shows login screen.
	 */
	public captchaReady(): void
	{
		if(this._closeButton && this._closeButton.parentNode)
		{
			this._closeButton.remove();
		}

		this.showScreen(2);
	}

	/**
	 * AS3: init()
	 * Initializes the login flow DOM — background, logo, views, side images.
	 */
	public init(): void
	{
		// Root overlay
		this._root = document.createElement('div');
		Object.assign(this._root.style, {
			position: 'absolute',
			top: '0',
			left: '0',
			width: '100%',
			height: '100%',
			zIndex: '10000',
			overflow: 'hidden',
			userSelect: 'none',
			fontFamily: "'Ubuntu', Arial, Helvetica, sans-serif",
		} as Partial<CSSStyleDeclaration>);

		const container = document.getElementById('helium-ui');

		if(container)
		{
			container.appendChild(this._root);
		}

		// AS3: _background = new Background(); addChild(_background)
		this._background = new Background();
		this._root.appendChild(this._background.element);
		this._background.mount();

		// AS3: _SafeStr_4566 = new Loader(); _SafeStr_4566.visible = false; _SafeStr_4566.alpha = 0
		this._SafeStr_4566 = document.createElement('img');
		Object.assign(this._SafeStr_4566.style, {
			position: 'absolute',
			bottom: '0',
			left: '-50px',
			zIndex: '0',
			pointerEvents: 'none',
			opacity: '0',
			transition: 'opacity 1.2s',
		} as Partial<CSSStyleDeclaration>);
		this._SafeStr_4566.draggable = false;
		this._root.appendChild(this._SafeStr_4566);

		// AS3: _SafeStr_4567 = new Loader(); _SafeStr_4567.visible = false; _SafeStr_4567.alpha = 0
		this._SafeStr_4567 = document.createElement('img');
		Object.assign(this._SafeStr_4567.style, {
			position: 'absolute',
			bottom: '0',
			right: '0',
			zIndex: '0',
			pointerEvents: 'none',
			opacity: '0',
			transition: 'opacity 1.2s',
		} as Partial<CSSStyleDeclaration>);
		this._SafeStr_4567.draggable = false;
		this._root.appendChild(this._SafeStr_4567);

		// AS3: _SafeStr_4565 = new Sprite(); habbo_logo_png at (40, 40)
		this._logoArea = document.createElement('div');
		Object.assign(this._logoArea.style, {
			position: 'absolute',
			left: '40px',
			top: '40px',
			zIndex: '2',
		} as Partial<CSSStyleDeclaration>);

		const logoImg = document.createElement('img');

		logoImg.src = habboLogoUrl;
		logoImg.alt = 'Habbo';
		logoImg.draggable = false;
		Object.assign(logoImg.style, {
			display: 'block',
			maxHeight: '50px',
		} as Partial<CSSStyleDeclaration>);
		this._logoArea.appendChild(logoImg);
		this._root.appendChild(this._logoArea);

		// AS3: _SafeStr_4564 = new Sprite(); _SafeStr_4564.y = 50; _SafeStr_4564.x = 5
		this._mainContainer = document.createElement('div');
		Object.assign(this._mainContainer.style, {
			position: 'absolute',
			zIndex: '1',
		} as Partial<CSSStyleDeclaration>);
		this._root.appendChild(this._mainContainer);

		// AS3: _SafeStr_4559 = new Sprite(); y=50, visible=true
		this._viewContainer = document.createElement('div');
		Object.assign(this._viewContainer.style, {
			position: 'relative',
		} as Partial<CSSStyleDeclaration>);
		this._mainContainer.appendChild(this._viewContainer);

		// AS3: Create all 4 views
		this._environmentView = new EnvironmentView(this);
		this._loginView = new LoginView(this);
		this._avatarView = new AvatarView(this);
		this._ssoTokenView = new SsoTokenView(this);

		// AS3: _closeButton = new ColouredButton("red", "X", new Rectangle(0, 0, 0, 40), true, onClose, 0xD8D8D8)
		this._closeButton = document.createElement('button');
		Object.assign(this._closeButton.style, {
			position: 'absolute',
			zIndex: '100',
			minWidth: '44px',
			height: '44px',
			padding: '0 12px',
			border: 'none',
			borderRadius: '6px',
			fontSize: '18px',
			fontWeight: 'bold',
			fontFamily: "'Ubuntu', Arial, Helvetica, sans-serif",
			cursor: 'pointer',
			textAlign: 'center',
			lineHeight: '44px',
			background: '#E53935',
			color: '#FFFFFF',
		} as Partial<CSSStyleDeclaration>);
		this._closeButton.textContent = 'X';
		this._closeButton.addEventListener('click', this._onClose);

		// AS3: _SafeStr_4560.init(); — pre-init environment view
		this._environmentView.init();

		// AS3: loadImages()
		this.loadImages();

		// AS3: showScreen(4) — SSO Token is the default screen
		this.showScreen(LoginFlow.SCREEN_SSO_TOKEN);

		// Layout
		this.layoutMainElements();

		// Listen for resize
		window.addEventListener('resize', this._onResize);
	}

	/**
	 * AS3: loadImages()
	 * Loads the left and right side background images from config.
	 */
	private loadImages(): void
	{
		const rightUri = this.getProperty('landing.view.background_right.uri');
		const leftUri = this.getProperty('landing.view.background_left.uri');

		if(rightUri && this._SafeStr_4567)
		{
			ImageLoader.CreateLoader(this._SafeStr_4567, rightUri, this._onImageComplete);
		}

		if(leftUri && this._SafeStr_4566)
		{
			ImageLoader.CreateLoader(this._SafeStr_4566, leftUri, this._onImageComplete);
		}
	}

	/**
	 * AS3: onImageComplete(_arg_1:ImageLoaderEvent)
	 * Shows the image with a fade-in effect.
	 * AS3: TweenUtils.alphaTweenVisible(_arg_1.loader, 0, 1.2)
	 */
	private _onImageComplete = (event: ImageLoaderEvent): void =>
	{
		log.info('Image complete: ' + event.url);

		// CSS transition handles the fade-in (opacity 0 -> 1 over 1.2s)
		event.loader.style.opacity = '1';

		this.layoutMainElements();
	};

	/**
	 * AS3: onClose(_arg_1:Button)
	 * Closes the captcha and shows the login screen.
	 */
	private _onClose = (): void =>
	{
		if(this._closeButton && this._closeButton.parentNode)
		{
			this._closeButton.remove();
		}

		// AS3: _SafeStr_597.closeCaptcha()
		// closeCaptcha not yet in ILoginProvider — stub
		this.showScreen(2);
	};

	/**
	 * AS3: hideViews()
	 * Removes all children from the view container.
	 */
	private hideViews(): void
	{
		if(this._viewContainer)
		{
			this._viewContainer.innerHTML = '';
		}
	}

	/**
	 * AS3: layoutMainElements()
	 * Centers the main container on screen and positions side images.
	 */
	private layoutMainElements(): void
	{
		if(this._disposed || !this._mainContainer) return;

		if(this._background)
		{
			this._background.resize();
		}

		// Center the main content area
		const stageW = window.innerWidth;
		const stageH = window.innerHeight;
		const contentWidth = this._mainContainer.offsetWidth + 20;

		let xPos: number;

		if(stageW > contentWidth)
		{
			xPos = Math.floor((stageW - contentWidth) / 2);

			if(xPos < MAIN_AREA_MARGIN)
			{
				xPos = MAIN_AREA_MARGIN;
			}
		}
		else
		{
			xPos = MAIN_AREA_MARGIN;
		}

		this._mainContainer.style.left = xPos + 'px';
		this._mainContainer.style.top = (LOGO_AREA_HEIGHT + 50) + 'px';

		// AS3: _closeButton.y = 30; _closeButton.x = (stage.stageWidth - _closeButton.width) - 30
		if(this._closeButton && this._closeButton.parentNode)
		{
			this._closeButton.style.top = '30px';
			this._closeButton.style.right = '30px';
		}

		// AS3: _SafeStr_4567.x = Math.max(400, (stage.stageWidth - _SafeStr_4567.width) + 50)
		// AS3: _SafeStr_4567.y = (stage.stageHeight - _SafeStr_4567.height) + 50
		if(this._SafeStr_4567)
		{
			const imgW = this._SafeStr_4567.naturalWidth || 0;
			const imgH = this._SafeStr_4567.naturalHeight || 0;

			this._SafeStr_4567.style.left = Math.max(400, (stageW - imgW) + 50) + 'px';
			this._SafeStr_4567.style.top = ((stageH - imgH) + 50) + 'px';
			this._SafeStr_4567.style.bottom = '';
		}

		// AS3: _SafeStr_4566.x = -50; _SafeStr_4566.y = (stage.stageHeight - _SafeStr_4566.height) + 50
		if(this._SafeStr_4566)
		{
			const imgH = this._SafeStr_4566.naturalHeight || 0;

			this._SafeStr_4566.style.left = '-50px';
			this._SafeStr_4566.style.top = ((stageH - imgH) + 50) + 'px';
			this._SafeStr_4566.style.bottom = '';
		}
	}

	/**
	 * AS3: onSsoTokenAvailable(_arg_1:SsoTokenAvailableEvent)
	 * Called when the Web API returns an SSO token.
	 */
	private _onSsoTokenAvailable = (token: string): void =>
	{
		this._ssoToken = token;
		this._events.emit(LoginFlow.LOGIN_FLOW_FINISHED_EVENT);
	};

	/** Bound resize handler. */
	private _onResize = (): void =>
	{
		if(!this._disposed)
		{
			this.layoutMainElements();
		}
	};

	/**
	 * AS3: createFakeContext(_arg_1:Dictionary)
	 *
	 * @see sources/win63_2021_version/login/LoginFlow.as lines 160-174
	 */
	private createFakeContext(): void
	{
		this._fakeContext = new FakeContext();

		this._configuration = this.createConfiguration();
		this._localization = this.createLocalization();
		this._communication = this.createCommunication();

		// AS3: _localization.loadDefaultEmbedLocalizations(_configuration.getProperty("environment.id"))
		if(this._localization)
		{
			const envId = this.getProperty('environment.id') ?? 'en';

			this._localization.loadDefaultEmbedLocalizations(envId);
		}

		// AS3: _SafeStr_597 = new WebApiLoginProvider(this)
		this._provider = new WebApiLoginProvider(this);

		// AS3: _SafeStr_597.addEventListener("SSO_TOKEN_AVAILABLE", onSsoTokenAvailable)
		this._provider.on(WebApiLoginProvider.SSO_TOKEN_AVAILABLE, this._onSsoTokenAvailable);
	}

	/**
	 * AS3: createConfiguration(_arg_1:IContext):HabboConfigurationManager
	 * In our port, we reuse the engine's already-loaded configuration manager.
	 */
	private createConfiguration(): IHabboConfigurationManager
	{
		return this._configuration;
	}

	/**
	 * AS3: createLocalization(_arg_1:IContext):HabboLocalizationManager
	 * Creates a standalone HabboLocalizationManager using the FakeContext.
	 */
	private createLocalization(): IHabboLocalizationManager
	{
		const localization = new HabboLocalizationManager(this._fakeContext!);

		localization.setConfigurationManager(this._configuration);

		return localization;
	}

	/**
	 * AS3: createCommunication(_arg_1:IContext):HabboCommunicationManager
	 * Creates a standalone HabboCommunicationManager using the FakeContext.
	 */
	private createCommunication(): IHabboCommunicationManager
	{
		const communication = new HabboCommunicationManager(this._fakeContext!);

		return communication;
	}

	/**
	 * AS3: dispose()
	 */
	public dispose(): void
	{
		if(this._disposed) return;

		this._disposed = true;

		window.removeEventListener('resize', this._onResize);

		if(this._errorTimer)
		{
			clearTimeout(this._errorTimer);
			this._errorTimer = 0;
		}

		this._provider.off(WebApiLoginProvider.SSO_TOKEN_AVAILABLE, this._onSsoTokenAvailable);
		this._provider.dispose();

		if(this._closeButton)
		{
			this._closeButton.removeEventListener('click', this._onClose);

			if(this._closeButton.parentNode)
			{
				this._closeButton.remove();
			}

			this._closeButton = null;
		}

		this.hideViews();

		if(this._environmentView)
		{
			this._environmentView.dispose();
			this._environmentView = null;
		}

		if(this._loginView)
		{
			this._loginView.dispose();
			this._loginView = null;
		}

		if(this._avatarView)
		{
			this._avatarView.dispose();
			this._avatarView = null;
		}

		if(this._ssoTokenView)
		{
			this._ssoTokenView.dispose();
			this._ssoTokenView = null;
		}

		if(this._background)
		{
			this._background.dispose();
			this._background = null;
		}

		if(this._root)
		{
			this._root.remove();
			this._root = null;
		}

		this._mainContainer = null;
		this._viewContainer = null;
		this._logoArea = null;
		this._errorBalloon = null;
		this._SafeStr_4566 = null;
		this._SafeStr_4567 = null;

		// AS3: dispose context and managers
		if(this._fakeContext)
		{
			this._fakeContext.dispose();
			this._fakeContext = null;
		}

		this._communication = null;
		this._localization = null;
	}
}
