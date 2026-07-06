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
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import {Helium} from 'helium-engine';
import {FakeContext} from './FakeContext';
import type {ILoginContext} from './ILoginContext';
import {Background} from './Background';
import {SsoTokenView} from './SsoTokenView';
import {EnvironmentView} from './EnvironmentView';
import {LoginView} from './LoginView';
import {AvatarView} from './AvatarView';
import {RegisterView} from './RegisterView';
import {AvatarCreateView} from './AvatarCreateView';
import {ImageLoader} from './ImageLoader';
import type {ImageLoaderEvent} from './ImageLoaderEvent';
import './login-ui.scss';

// Import logo
import habboLogoUrl from '../assets/images/logo_new_png_6d13b64d33dd9875a45476d55c94853e-93072960.png';

const log = Logger.getLogger('LoginFlow');

export class LoginFlow implements ILoginContext, ILoginViewer 
{
    static readonly LOGIN_FLOW_FINISHED_EVENT = 'LOGIN_FLOW_FINISHED_EVENT';
    static readonly SCREEN_ENVIRONMENT = 1;
    static readonly SCREEN_LOGIN = 2;
    static readonly SCREEN_AVATARS = 3;
    static readonly SCREEN_SSO_TOKEN = 4;
    static readonly SCREEN_REGISTER = 5;
    static readonly SCREEN_AVATAR_CREATE = 6;

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

    /** AS3: _stepRegister — OnBoardingHcStepRegister (vortex-client onBoardingHc source) */
    private _registerView: RegisterView | null = null;

    /** AS3: _stepAvatarCreate — OnBoardingHcStepAvatarCreate (vortex-client onBoardingHc source) */
    private _avatarCreateView: AvatarCreateView | null = null;

    private _root: HTMLDivElement | null = null;

    /** Split-screen shell (.habbo-split) — not a literal AS3 element, see login-ui.scss header comment. */
    private _splitRoot: HTMLDivElement | null = null;

    /** Illustration column (.habbo-split__art) wrapping _heroImage. */
    private _artWrap: HTMLDivElement | null = null;

    /** AS3: _SafeStr_4567 — hero illustration, loaded from landing.view.background_right.uri */
    private _heroImage: HTMLImageElement | null = null;

    /** AS3: _SafeStr_4564 — main container (now the .habbo-split__content column) */
    private _mainContainer: HTMLDivElement | null = null;

    /** AS3: _SafeStr_4559 — view container */
    private _viewContainer: HTMLDivElement | null = null;

    /** AS3: _SafeStr_4565 — logo area */
    private _logoArea: HTMLDivElement | null = null;

    private _errorBalloon: HTMLDivElement | null = null;
    private _errorTimer: number = 0;

    /** AS3: _closeButton — ColouredButton("red", "X") */
    private _closeButton: HTMLButtonElement | null = null;

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
     * EventEmitter for login flow events.
     * Listen for LOGIN_FLOW_FINISHED_EVENT.
     */
    get loginEvents(): EventEmitter 
    {
        return this._events;
    }

    /**
     * AS3: get avatarRenderManager():IAvatarRenderManager — OnBoardingHc.as
     * The engine's avatar render manager is already bootstrapped before the login
     * flow is shown (see HeliumApp.init()), so we reuse it directly rather than
     * standing up a second onboarding-only renderer as AS3 does.
     */
    public get avatarRenderManager(): IAvatarRenderManager | null 
    {
        return Helium.instance.windowManager.avatarRenderer;
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
     * AS3: registerAccount(email, password) — OnBoardingHc.as
     * Delegates to WebApiLoginProvider which calls POST /api/public/registration/new.
     */
    public registerAccount(email: string, password: string): void 
    {
        this._provider.register(email, password);
    }

    /**
     * AS3: createAvatar(name, figure, gender) — OnBoardingHc.as
     * Delegates to WebApiLoginProvider which calls POST /api/user/avatars.
     */
    public createAvatar(name: string, figure: string, gender: string): void 
    {
        this._provider.createAvatar(name, figure, gender);
    }

    /**
     * AS3: checkName(name) — OnBoardingHc.as
     * Delegates to WebApiLoginProvider which calls POST /api/newuser/name/check.
     */
    public checkName(name: string): void 
    {
        this._provider.checkName(name);
    }

    /**
     * AS3: showSelectAvatar(avatar:Object) — OnBoardingHc.as
     * Called by WebApiLoginProvider after a successful registration.
     */
    public showSelectAvatar(_response: unknown): void 
    {
        this.showScreen(LoginFlow.SCREEN_AVATAR_CREATE);
    }

    /**
     * AS3: nameCheckResponse(response:Object, isValid:Boolean) — OnBoardingHc.as
     * Forwards the name-check result to the AvatarCreate screen.
     */
    public nameCheckResponse(response: unknown, isValid: boolean): void 
    {
        this._avatarCreateView?.onNameCheckResult(response, isValid);
    }

    /**
     * AS3: showScreen(_arg_1:int)
     * Switches between login screens.
     */
    public showScreen(screen: number): void 
    {
        this.hideViews();

        // The avatar creator is a wide 3-column editor (looks / colours / preview) that
        // doesn't fit the split-screen form layout — give it the full width and drop the
        // illustration; every other screen keeps the illustration + narrow form column.
        if(this._splitRoot) 
        {
            this._splitRoot.classList.toggle('habbo-split--full', screen === LoginFlow.SCREEN_AVATAR_CREATE);
        }

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
                }

                this.layoutMainElements();
                break;

            case LoginFlow.SCREEN_REGISTER:
                if(this._registerView && this._viewContainer) 
                {
                    this._viewContainer.appendChild(this._registerView.element);
                    this._registerView.init();
                }

                break;

            case LoginFlow.SCREEN_AVATAR_CREATE:
                if(this._avatarCreateView && this._viewContainer) 
                {
                    this._viewContainer.appendChild(this._avatarCreateView.element);
                    this._avatarCreateView.init();
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
        // AS3: LoaderUI.createBalloon(...) tinted red + LoaderUI.addEtching(messageField, true)
        if(!this._errorBalloon) 
        {
            this._errorBalloon = document.createElement('div');
            Object.assign(this._errorBalloon.style, {
                position: 'fixed',
                top: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderRadius: '10px',
                background: '#A02942',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '700',
                fontFamily: "'Ubuntu', Arial, Helvetica, sans-serif",
                zIndex: '20000',
                maxWidth: '400px',
                padding: '12px 20px',
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            } as Partial<CSSStyleDeclaration>);
            this._root?.appendChild(this._errorBalloon);
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
        // Root overlay.
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

        // Split-screen shell: illustration on the left, form content on the right.
        // See login-ui.scss for why this replaced AS3's scattered absolute-positioned Sprites.
        this._splitRoot = document.createElement('div');
        this._splitRoot.className = 'habbo-split';
        this._root.appendChild(this._splitRoot);

        this._artWrap = document.createElement('div');
        this._artWrap.className = 'habbo-split__art';
        this._heroImage = document.createElement('img');
        this._heroImage.alt = '';
        this._heroImage.draggable = false;
        this._artWrap.appendChild(this._heroImage);
        this._splitRoot.appendChild(this._artWrap);

        // AS3: _SafeStr_4564 = new Sprite() — the content column.
        this._mainContainer = document.createElement('div');
        this._mainContainer.className = 'habbo-split__content';
        this._splitRoot.appendChild(this._mainContainer);

        // AS3: _SafeStr_4559 = new Sprite(); y=50, visible=true
        this._viewContainer = document.createElement('div');
        this._viewContainer.style.width = '100%';
        this._mainContainer.appendChild(this._viewContainer);

        // AS3: Create all views
        this._environmentView = new EnvironmentView(this);
        this._loginView = new LoginView(this);
        this._avatarView = new AvatarView(this);
        this._ssoTokenView = new SsoTokenView(this);
        this._registerView = new RegisterView(this);
        this._avatarCreateView = new AvatarCreateView(this);

        // AS3: _closeButton = new ColouredButton("red", "X", new Rectangle(0, 0, 0, 40), true, onClose, 0xD8D8D8)
        this._closeButton = document.createElement('button');
        this._closeButton.className = 'habbo-btn habbo-btn--red';
        Object.assign(this._closeButton.style, {
            position: 'fixed',
            top: '30px',
            right: '30px',
            zIndex: '100',
            minWidth: '0',
            width: '44px',
            height: '44px',
            padding: '0',
        } as Partial<CSSStyleDeclaration>);
        this._closeButton.textContent = '✕';
        this._closeButton.addEventListener('click', this._onClose);

        // AS3: _SafeStr_4560.init(); — pre-init environment view
        this._environmentView.init();

        // AS3: loadImages()
        this.loadImages();

        // AS3: init() — if(isSsoTokenEnabled()) showScreen(SCREEN_SSO_TOKEN); else showScreen(SCREEN_LOGIN);
        this.showScreen(this.isSsoTokenEnabled() ? LoginFlow.SCREEN_SSO_TOKEN : LoginFlow.SCREEN_LOGIN);

        // Layout
        this.layoutMainElements();

        // Listen for resize
        window.addEventListener('resize', this._onResize);
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

        if(this._registerView) 
        {
            this._registerView.dispose();
            this._registerView = null;
        }

        if(this._avatarCreateView) 
        {
            this._avatarCreateView.dispose();
            this._avatarCreateView = null;
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
        this._splitRoot = null;
        this._artWrap = null;
        this._heroImage = null;

        // AS3: dispose context and managers
        if(this._fakeContext) 
        {
            this._fakeContext.dispose();
            this._fakeContext = null;
        }

        this._communication = null;
        this._localization = null;
    }

    /**
     * AS3: isSsoTokenEnabled():Boolean — OnBoardingHc.as
     * Decides the default screen. common_configuration_txt.txt sets "use.sso=false",
     * so this normally resolves to false and the flow opens on Login, not SSO Token.
     */
    private isSsoTokenEnabled(): boolean 
    {
        if(!this._configuration) return false;

        if(this._configuration.propertyExists('use.sso')) 
        {
            return this._configuration.getBoolean('use.sso');
        }

        return this.getProperty('connection.info.login') === null;
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
     * AS3: loadImages()
     * Loads the hero illustration from config. AS3 loads a left AND right side image
     * (peeking in from both bottom corners); the split-screen redesign shows a single,
     * large illustration instead, so only the right one (the hotel building) is used.
     */
    private loadImages(): void 
    {
        const heroUri = this.getProperty('landing.view.background_right.uri');

        if(heroUri && this._heroImage) 
        {
            ImageLoader.CreateLoader(this._heroImage, heroUri, this._onImageComplete);
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
     * The split layout and close button are handled entirely by CSS (flexbox,
     * position:fixed) — nothing left to compute on resize besides the background,
     * which is itself a CSS no-op (see Background.resize()). Kept as a hook for
     * loadImages()/resize to call into without needing to know that.
     */
    private layoutMainElements(): void 
    {
        if(this._disposed) return;

        this._background?.resize();
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
}
