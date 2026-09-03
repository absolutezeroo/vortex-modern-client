/**
 * LoginFlow
 *
 * AS3: sources/WIN63-202607011411-782849652/src/login/LoginFlow.as
 *
 * The whole pre-client experience: it stands up its own configuration, localisation and
 * communication managers on a fake context, owns the four screens, and hands an SSO ticket back to
 * the host once the user is through.
 *
 * Things worth knowing before changing anything here:
 * - It runs with NO engine behind it. AS3 gates `startCoreInitializationIfPossible()` on the
 *   loading screen, which only exists after login, so nothing of the game — including the
 *   furnidata download — loads until this flow is finished. The managers below are built from the
 *   embedded asset libraries alone for that reason.
 * - `init()` opens on SCREEN_SSO_TOKEN, unconditionally. That is what the 701 source does; the
 *   ticket screen is the way in, and the hotel picker is reachable from its Cancel button.
 * - It is both `ILoginContext` (what the views call) and `ILoginViewer` (what the provider calls
 *   back). The provider's fine-grained error callbacks all funnel into `showError()`, which is
 *   where the error-code-to-localisation-key mapping lives.
 */
import {EventEmitter} from 'eventemitter3';
import {Logger} from '@core/utils/Logger';
import type {ICoreLocalizationManager} from '@core/localization/ICoreLocalizationManager';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import {HabboCommunicationManager} from '@habbo/communication/HabboCommunicationManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import {HabboConfigurationManager} from '@habbo/configuration/HabboConfigurationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import {HabboLocalizationManager} from '@habbo/localization/HabboLocalizationManager';
import type {AvatarData} from '@habbo/communication/login/AvatarData';
import type {ICaptchaView} from '@habbo/communication/login/ICaptchaView';
import type {ILoginProvider} from '@habbo/communication/login/ILoginProvider';
import type {ILoginViewer} from '@habbo/communication/login/ILoginViewer';
import {WebApiLoginProvider} from '@habbo/communication/login/WebApiLoginProvider';
import {CommunicationUtils} from '@habbo/utils/CommunicationUtils';
import {Bitmap} from '../onBoardingHcUi/display/Bitmap';
import {Sprite} from '../onBoardingHcUi/display/DisplayObjectContainer';
import {GlowFilter} from '../onBoardingHcUi/display/Filters';
import {Rectangle} from '../onBoardingHcUi/display/Geom';
import type {TextField} from '../onBoardingHcUi/display/TextField';
import {Timer} from '../onBoardingHcUi/display/Timer';
import {TweenUtils} from '../onBoardingHcUi/display/TweenUtils';
import {ColouredButton} from '../onBoardingHcUi/ColouredButton';
import {LoaderUI} from '../onBoardingHcUi/LoaderUI';
import {LocalizedSprite} from '../onBoardingHcUi/LocalizedSprite';
import {LocalizedTextField} from '../onBoardingHcUi/LocalizedTextField';
import {LoginAssets} from '../onBoardingHcUi/LoginAssets';
import {AvatarView} from './AvatarView';
import {Background} from './Background';
import {EnvironmentView} from './EnvironmentView';
import {FakeContext} from './FakeContext';
import type {ILoginContext} from './ILoginContext';
import {ImageLoader} from './ImageLoader';
import type {ImageLoaderEvent} from './ImageLoaderEvent';
import {LoginView} from './LoginView';
import {RegisterView} from './RegisterView';
import {SsoTokenView} from './SsoTokenView';
import {WebCaptchaView} from './WebCaptchaView';

const log = Logger.getLogger('client.login.LoginFlow');

// DEVIATION: the AS3 class declares four `[Embed]` font classes — ubuntu_regular, ubuntu_bold,
//   ubuntu_italic, ubuntu_bold_italic — the SWF's copy of a font the player's machine may not
//   have. The port embeds them too, once for the whole client rather than once per class that
//   needs them: `App.ts`'s `WEBFONT_FACES` table has an entry per face (Ubuntu.ttf, -b, -i, -ib)
//   and `loadWebFonts()` reads their bytes out of the asset bundle and registers each through the
//   `FontFace` API. Same bytes, same origin, same guarantee — a player without Ubuntu installed
//   still gets Ubuntu. Four per-class references would register the same four faces four times.
//   Same note on LoaderUI.ts and OnBoardingHcFlow.ts, which declare the same four.
// AS3: sources/WIN63-202607011411-782849652/src/login/LoginFlow.as::ubuntu_regular
export class LoginFlow extends Sprite implements ILoginContext, ILoginViewer
{
    // AS3: LOGIN_FLOW_FINISHED_EVENT
    public static readonly LOGIN_FLOW_FINISHED_EVENT: string = 'LOGIN_FLOW_FINISHED_EVENT';

    // AS3: SCREEN_ENVIRONMENT
    public static readonly SCREEN_ENVIRONMENT: number = 1;

    // AS3: SCREEN_LOGIN
    public static readonly SCREEN_LOGIN: number = 2;

    // AS3: SCREEN_AVATARS
    public static readonly SCREEN_AVATARS: number = 3;

    // AS3: SCREEN_SSO_TOKEN
    public static readonly SCREEN_SSO_TOKEN: number = 4;

    // TS-only: no AS3 counterpart — the dump's screen ids stop at 4. See `RegisterView`'s header for
    // why the screen exists at all and what of it is actually AS3.
    public static readonly SCREEN_REGISTER: number = 5;

    // AS3: ERROR_TYPE_IO_ERROR
    private static readonly ERROR_TYPE_IO_ERROR: string = 'ioError';

    // AS3: LOGO_AREA_HEIGHT
    private static readonly LOGO_AREA_HEIGHT: number = 50;

    // AS3: MAIN_AREA_MARGIN
    private static readonly MAIN_AREA_MARGIN: number = 5;

    // AS3: _background
    private _background: Background | null = null;

    // AS3: _viewContainer
    private _viewContainer: Sprite | null = null;

    // AS3: _environmentView
    private _environmentView: EnvironmentView | null = null;

    // AS3: _loginView
    private _loginView: LoginView | null = null;

    // TS-only: the registration screen — see `RegisterView`'s header.
    private _registerView: RegisterView | null = null;

    // AS3: _ssoTokenView
    private _ssoTokenView: SsoTokenView | null = null;

    // AS3: _avatarView
    private _avatarView: AvatarView | null = null;

    // AS3: _disposed
    private _disposed: boolean = false;

    // AS3: _context — FakeContext
    private _fakeContext: FakeContext | null = null;

    // AS3: _errorBalloon
    private _errorBalloon: Sprite | null = null;

    // AS3: _mainSprite
    private _mainSprite: Sprite | null = null;

    // AS3: _logoArea
    private _logoArea: Sprite | null = null;

    // AS3: _configuration
    private _configuration: IHabboConfigurationManager;

    // AS3: _communication
    private _communication: IHabboCommunicationManager | null = null;

    // AS3: _localization
    private _localization: IHabboLocalizationManager | null = null;

    // AS3: _provider
    private _provider: ILoginProvider;

    // AS3: _ssoToken
    private _ssoToken: string | null = null;

    // AS3: _closeButton
    private _closeButton: ColouredButton | null = null;

    // AS3: _backgroundLeft
    private _backgroundLeft: Bitmap | null = null;

    // AS3: _backgroundRight
    private _backgroundRight: Bitmap | null = null;

    // AS3: _lastFrameTime
    private _lastFrameTime: number = 0;

    /**
     * TS-only: AS3 dispatches `LOGIN_FLOW_FINISHED_EVENT` on itself as a display-list event; the
     * host listens through this emitter instead, since it is not part of the display list.
     */
    private readonly _loginEvents: EventEmitter = new EventEmitter();

    /**
     * TS-only: the embedded configuration TextAssets. AS3 reads them out of the embedded
     * `HabboConfigurationCom` library; the port is handed the same content by the host.
     */
    private readonly _embeddedConfigurations: Record<string, string>;

    /** TS-only: where DOM-side pieces (the captcha frame) are mounted. */
    private readonly _domContainer: HTMLElement;

    /** TS-only: the live captcha view, so `captchaReady()` can take it down. */
    private _captchaView: WebCaptchaView | null = null;

    // AS3: LoginFlow(_arg_1:Dictionary)
    constructor(embeddedConfigurations: Record<string, string>, domContainer: HTMLElement)
    {
        super();

        this._embeddedConfigurations = embeddedConfigurations;
        this._domContainer = domContainer;
        this.createFakeContext();
    }

    // AS3: get ssoToken():String
    public get ssoToken(): string | null
    {
        return this._ssoToken;
    }

    // AS3: get disposed():Boolean
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // TS-only: the emitter carrying LOGIN_FLOW_FINISHED_EVENT to the host.
    public get loginEvents(): EventEmitter
    {
        return this._loginEvents;
    }

    // AS3: get debugText():TextField — null in the 701 source.
    public get debugText(): TextField | null
    {
        return null;
    }

    /**
     * AS3: init()
     *
     * Builds the background, the logo, the four views and the captcha close button, kicks off the
     * two landing images, and opens on the ticket screen.
     */
    // AS3: .../src/login/LoginFlow.as::init()
    public init(): void
    {
        this.stage?.addEventListener('resize', this._onStageResize);
        this._background = new Background();
        this.addChild(this._background);
        this._backgroundLeft = new Bitmap();
        this._backgroundLeft.visible = false;
        this._backgroundLeft.alpha = 0;
        this.addChild(this._backgroundLeft);
        this._backgroundRight = new Bitmap();
        this._backgroundRight.visible = false;
        this._backgroundRight.alpha = 0;
        this.addChild(this._backgroundRight);
        this._logoArea = new Sprite();
        this.addChild(this._logoArea);

        const logo = new Bitmap(LoginAssets.get('logo_new'));

        logo.x = 40;
        logo.y = 40;
        this._logoArea.addChild(logo);
        this._mainSprite = new Sprite();
        this.addChild(this._mainSprite);
        this._mainSprite.y = LoginFlow.LOGO_AREA_HEIGHT;
        this._mainSprite.x = LoginFlow.MAIN_AREA_MARGIN;
        this._viewContainer = new Sprite();
        this._viewContainer.x = 0;
        this._viewContainer.y = 50;
        this._viewContainer.visible = true;
        this._mainSprite.addChild(this._viewContainer);
        this._environmentView = new EnvironmentView(this);
        this._loginView = new LoginView(this);
        this._registerView = new RegisterView(this);
        this._avatarView = new AvatarView(this);
        this._ssoTokenView = new SsoTokenView(this);
        this._closeButton = new ColouredButton(
            'red',
            'X',
            new Rectangle(0, 0, 0, 40),
            true,
            this._onClose,
            14211288
        );
        this._environmentView.init();
        this.loadImages();
        this.showScreen(LoginFlow.SCREEN_SSO_TOKEN);
        this.layoutMainElements();
        this.addEventListener('addedToStage', this._onAddedToStage);
        this.addEventListener('enterFrame', this._onEnterFrame);

        // The flow is normally already on the stage by the time init() runs, in which case
        // `addedToStage` has fired and will not fire again.
        if(this.stage)
        {
            this._lastFrameTime = performance.now();
            this.layoutMainElements();
        }
    }

    /**
     * AS3: showScreen(_arg_1:int)
     */
    // AS3: .../src/login/LoginFlow.as::showScreen()
    public showScreen(screen: number): void
    {
        this.hideViews();

        switch(screen)
        {
            case LoginFlow.SCREEN_ENVIRONMENT:
                if(this._viewContainer && this._environmentView)
                {
                    this._viewContainer.addChild(this._environmentView);
                    this._environmentView.init();
                }

                break;

            case LoginFlow.SCREEN_LOGIN:
                if(this._viewContainer && this._loginView)
                {
                    this._viewContainer.addChild(this._loginView);
                    this._loginView.init();
                    this._provider.init(this._communication);
                }

                break;

            case LoginFlow.SCREEN_AVATARS:
                if(this._viewContainer && this._avatarView)
                {
                    this._viewContainer.addChild(this._avatarView);
                    this._avatarView.init();
                    this._avatarView.baseUrl = this.getProperty('web.api') ?? '';
                    this.layoutMainElements();
                }

                break;

            case LoginFlow.SCREEN_SSO_TOKEN:
                if(this._viewContainer && this._ssoTokenView)
                {
                    this._viewContainer.addChild(this._ssoTokenView);
                    this._ssoTokenView.init();
                }

                break;

            // TS-only: same shape as SCREEN_LOGIN — the provider is (re)initialised here too, since
            // registration answers come back through it.
            case LoginFlow.SCREEN_REGISTER:
                if(this._viewContainer && this._registerView)
                {
                    this._viewContainer.addChild(this._registerView);
                    this._registerView.init();
                    this._provider.init(this._communication);
                }

                break;
        }

        this.layoutMainElements();
    }

    // AS3: initLogin(_arg_1:String, _arg_2:String) — `code` is TS-only, see `ILoginContext`.
    public initLogin(email: string, password: string, code?: string): void
    {
        this._provider.loginWithCredentials(email, password, 0, code);
    }

    /**
     * TS-only: posts the registration `RegisterView` collected.
     *
     * `HabboWebApiSession.register()` IS the AS3 method (`/api/public/registration/new`, declared
     * POST in the web-api route interface); only the screen that calls it is missing from the dump.
     * Its last three arguments are sent as AS3 sends them and are not collected: `vortex-emulator`'s
     * endpoint reads the address and the password alone, so a birthdate form would be asking for
     * something nothing stores. They are zeroes rather than a plausible-looking date, so the
     * payload does not claim a birthday the user never gave; the captcha token is empty because no
     * captcha is presented here (`WebCaptchaView` belongs to the login path).
     *
     * The answer comes back through `WebApiLoginProvider`: `showSelectAvatar()` on success,
     * `showRegistrationError()` on failure — both already implemented below.
     */
    public initRegister(email: string, password: string): void
    {
        const session = this._communication?.getHabboWebApiSession() ?? null;

        if(!session)
        {
            log.warn('No web API session to register on');

            return;
        }

        session.register(email, password, 0, 0, 0, true, '');
    }

    /**
     * TS-only: adds an avatar to the account already signed in on the web session.
     *
     * Same route and same reasoning as the one `showSelectAvatar()` posts after a registration, and
     * the name is left empty for the same reason: the onboarding step the server asks for on the
     * first connection owns naming, and it owns the look editor with it. A brand-new avatar has no
     * `NuxCompletedAt`, so it gets that step exactly like the account's first one did.
     *
     * The answer is the refreshed avatar list, which the provider routes back to
     * `populateCharacterList()` — so the picker simply repopulates with the new avatar on it.
     */
    public createAvatar(): void
    {
        const session = this._communication?.getHabboWebApiSession() ?? null;

        if(!session)
        {
            log.warn('No web API session to create an avatar on');

            return;
        }

        log.debug('Creating an additional avatar');
        session.createAvatar('');
    }

    /**
     * AS3: initLoginWithSsoToken(_arg_1:String, _arg_2:String)
     *
     * Commits the ticket's environment first (`false` = not a preview), then finishes immediately —
     * a ticket needs no web API round trip.
     */
    // AS3: .../src/login/LoginFlow.as::initLoginWithSsoToken()
    public initLoginWithSsoToken(environmentId: string, token: string): void
    {
        this.updateEnvironment(environmentId, false);
        this._ssoToken = token;
        this._loginEvents.emit(LoginFlow.LOGIN_FLOW_FINISHED_EVENT);
    }

    // AS3: loginWithAvatar(_arg_1:AvatarData)
    public loginWithAvatar(avatar: AvatarData): void
    {
        this._provider.loginWithCredentialsWeb(avatar.uniqueId);
    }

    // AS3: editorFinished()
    public editorFinished(): void
    {
        this._loginEvents.emit(LoginFlow.LOGIN_FLOW_FINISHED_EVENT);
    }

    /**
     * AS3: getProperty(_arg_1:String, _arg_2:Dictionary=null):String
     *
     * A missing property is logged, not silently defaulted — AS3 prints "Add property:" for it.
     */
    // AS3: .../src/login/LoginFlow.as::getProperty()
    public getProperty(key: string): string | null
    {
        const value = this._configuration ? this._configuration.getProperty(key) : '';

        if(!value || value.length === 0)
        {
            log.debug(`[LoginFlow] Add property: ${key}`);
        }

        return value && value.length > 0 ? value : null;
    }

    /**
     * AS3: updateEnvironment(_arg_1:String, _arg_2:Boolean)
     *
     * `_arg_2` is the PREVIEW flag: true reloads only that hotel's texts and returns; false commits
     * — stores the choice, repoints the configuration, re-reads the localisations, and re-resolves
     * the connection host.
     */
    // AS3: .../src/login/LoginFlow.as::updateEnvironment()
    public updateEnvironment(environmentId: string, preview: boolean): void
    {
        if(preview)
        {
            this._localization?.loadDefaultEmbedLocalizations(environmentId);

            return;
        }

        CommunicationUtils.writeProperty(CommunicationUtils.SOL_PROPERTY_ENVIRONMENT, environmentId);
        this._configuration.updateEnvironmentId(environmentId);
        this._environmentView?.updateEnvironment();
        this._localization?.loadDefaultEmbedLocalizations(this.getProperty('environment.id') ?? environmentId);
        log.debug(`[LoginFlow] updated environment to: ${environmentId}`);
        this._communication?.updateHostParameters();
        this._localization?.requestLocalizationInit();
    }

    /**
     * AS3: showErrorMessage(_arg_1:String)
     *
     * The balloon is built once and reused; every call restarts the three-second timer.
     */
    // AS3: .../src/login/LoginFlow.as::showErrorMessage()
    public showErrorMessage(message: string): void
    {
        if(!this._mainSprite) return;

        if(this._errorBalloon == null)
        {
            const messageField = LoaderUI.createTextField(message, 12, 16777215, true);

            LoaderUI.addEtching(messageField, true);

            const balloon = LoaderUI.createBalloon(
                messageField.width + 30,
                messageField.height + 17,
                -1,
                true,
                11411485,
                'down'
            );

            this._errorBalloon = new Sprite();
            this._errorBalloon.addChild(balloon);
            this._errorBalloon.addChild(messageField);
            messageField.x = 15;
            messageField.y = 14;
            this._mainSprite.addChild(this._errorBalloon);
            this._errorBalloon.x = 300;
            this._errorBalloon.y = 300;
            this._errorBalloon.filters = [new GlowFilter(0, 0.24, 6, 6)];
        }

        const timer = new Timer(3000, 1);

        timer.addEventListener('timerComplete', this._onHideError);
        timer.start();
        this._errorBalloon.visible = true;
    }

    // AS3: showLoginScreen() — empty in the 701 source.
    public showLoginScreen(): void
    {
        // AS3 leaves this empty.
    }

    // AS3: showRegistrationError(_arg_1:Object)
    public showRegistrationError(error: unknown): void
    {
        this.showError(error);
    }

    // AS3: showInvalidLoginError(_arg_1:Object)
    public showInvalidLoginError(error: unknown): void
    {
        this.showError(error);
    }

    // AS3: nameCheckResponse(_arg_1:Object, _arg_2:Boolean) — empty in the 701 source.
    public nameCheckResponse(_response: unknown, _fromNameCheck: boolean): void
    {
        // AS3 leaves this empty — the desktop flow has no name-check screen.
    }

    // AS3: showAccountError(_arg_1:Object)
    public showAccountError(error: unknown): void
    {
        this.showError(error);
    }

    // AS3: showLoadingScreen() — empty in the 701 source.
    public showLoadingScreen(): void
    {
        // AS3 leaves this empty.
    }

    // AS3: saveLooksError(_arg_1:Object)
    public saveLooksError(error: unknown): void
    {
        this.showError(error);
    }

    // AS3: showTOS()
    public showTOS(): void
    {
        this.showErrorMessage('Need to show TOS');
    }

    // AS3: environmentReady()
    public environmentReady(): void
    {
        this._loginView?.ready();
    }

    // AS3: populateCharacterList(_arg_1:Vector.<AvatarData>)
    public populateCharacterList(avatars: AvatarData[]): void
    {
        this.showScreen(LoginFlow.SCREEN_AVATARS);
        this._avatarView?.populateAvatars(avatars);
    }

    /**
     * AS3: showSelectAvatar(_arg_1:Object) — empty in the 701 source.
     *
     * The provider calls this from one place only: the success arm of
     * `/api/public/registration/new`. AS3 leaves the body empty because registration is a web flow
     * there and the browser, not the client, carries on.
     *
     * TS-only from here: a fresh account owns no avatar (`RegisterAsync` inserts the account row
     * alone), so `/api/user/avatars` would answer an empty list and the flow would stall on a
     * chooser with nothing in it. `createAvatar()` is the other real AS3 route
     * (`POST /api/user/avatars`) and is what creates the player. The name is left empty on purpose:
     * naming the avatar is the job of the onboarding step the server is about to ask for —
     * `AuthenticationOK` carries `AVATAR_NAME_CHANGE` for as long as the player has no
     * `NuxCompletedAt`, and that step owns both the look editor and the name dialog. The emulator
     * fills in a placeholder until then.
     *
     * Nothing further is needed here: the answer is the refreshed avatar list, which the provider
     * routes to its `/api/user/avatars` arm — and that arm selects outright when the account owns
     * exactly one avatar, which is precisely this case. Ticket, connection and onboarding follow on
     * their own.
     */
    // AS3: .../src/login/LoginFlow.as::showSelectAvatar()
    public showSelectAvatar(_response: unknown): void
    {
        const session = this._communication?.getHabboWebApiSession() ?? null;

        if(!session)
        {
            log.warn('Registered, but there is no web API session to create the avatar on');

            return;
        }

        log.debug('Account created; creating its avatar');
        session.createAvatar('');
    }

    // AS3: showPromoHabbos(_arg_1:XML) — empty in the 701 source.
    public showPromoHabbos(_looks: unknown): void
    {
        // AS3 leaves this empty.
    }

    // AS3: showSelectRoom() — empty in the 701 source.
    public showSelectRoom(): void
    {
        // AS3 leaves this empty.
    }

    // AS3: showCaptchaError()
    public showCaptchaError(): void
    {
        this.showScreen(LoginFlow.SCREEN_LOGIN);
        this.showErrorMessage('Error with captcha');
    }

    /**
     * AS3: createCaptchaView():ICaptchaView
     *
     * The close button is added to the flow itself, above every screen, so the captcha can be
     * dismissed even though the view covers the stage.
     */
    // AS3: .../src/login/LoginFlow.as::createCaptchaView()
    public createCaptchaView(): ICaptchaView | null
    {
        if(this._closeButton)
        {
            this.addChild(this._closeButton);
        }

        const view = new WebCaptchaView(this._provider as unknown as WebApiLoginProvider);

        view.mount(this._domContainer);
        this._captchaView = view;
        this.layoutMainElements();

        return view;
    }

    // AS3: captchaReady()
    public captchaReady(): void
    {
        if(this._closeButton)
        {
            this.removeChild(this._closeButton);
        }

        this._captchaView?.dispose();
        this._captchaView = null;
        this.showScreen(LoginFlow.SCREEN_LOGIN);
    }

    /**
     * AS3: layoutMainElements()
     *
     * Centres the content column when the stage is wide enough, pins the close button to the top
     * right, and hangs the two landing illustrations off the bottom corners — the right one
     * clamped so it never crosses x=400.
     */
    // AS3: .../src/login/LoginFlow.as::layoutMainElements()
    private layoutMainElements(): void
    {
        const stage = this.stage;

        if(this.disposed || !stage || !this._mainSprite) return;

        this._background?.resize();

        const contentWidth = this._mainSprite.width + 20;

        if(stage.stageWidth > contentWidth)
        {
            let offset = Math.trunc((stage.stageWidth - contentWidth) / 2);

            if(offset < LoginFlow.MAIN_AREA_MARGIN)
            {
                offset = LoginFlow.MAIN_AREA_MARGIN;
            }

            this._mainSprite.x = offset;
        }
        else
        {
            this._mainSprite.x = LoginFlow.MAIN_AREA_MARGIN;
        }

        this._mainSprite.y = LoginFlow.LOGO_AREA_HEIGHT;

        if(this._closeButton)
        {
            this._closeButton.y = 30;
            this._closeButton.x = stage.stageWidth - this._closeButton.width - 30;
        }

        if(this._backgroundRight)
        {
            this._backgroundRight.x = Math.max(400, stage.stageWidth - this._backgroundRight.width + 50);
            this._backgroundRight.y = stage.stageHeight - this._backgroundRight.height + 50;
        }

        if(this._backgroundLeft)
        {
            this._backgroundLeft.x = -50;
            this._backgroundLeft.y = stage.stageHeight - this._backgroundLeft.height + 50;
        }
    }

    // AS3: loadImages()
    private loadImages(): void
    {
        if(!this._backgroundRight || !this._backgroundLeft) return;

        const right = this.getProperty('landing.view.background_right.uri');
        const left = this.getProperty('landing.view.background_left.uri');

        if(right)
        {
            ImageLoader.createLoader(this._backgroundRight, right, this._onImageComplete);
        }

        if(left)
        {
            ImageLoader.createLoader(this._backgroundLeft, left, this._onImageComplete);
        }
    }

    /**
     * AS3: onImageComplete(_arg_1:ImageLoaderEvent)
     */
    private _onImageComplete = (event: ImageLoaderEvent): void =>
    {
        log.debug(`Image complete: ${event.url}`);
        event.loader.visible = true;
        TweenUtils.alphaTweenVisible(event.loader, 0, TweenUtils.REALLY_SLOW_ALPHA_TWEEN_TIME);
        this.layoutMainElements();
    };

    // AS3: onAddedToStage(_arg_1:Event)
    private _onAddedToStage = (): void =>
    {
        this.removeEventListener('addedToStage', this._onAddedToStage);
        this._lastFrameTime = performance.now();
        this.layoutMainElements();
    };

    /**
     * AS3: onEnterFrame(_arg_1:Event)
     *
     * Advances the shared tween juggler by the frame delta, in seconds.
     */
    private _onEnterFrame = (): void =>
    {
        const now = performance.now();

        TweenUtils.JUGGLER.advanceTime((now - this._lastFrameTime) / 1000);
        this._lastFrameTime = now;
    };

    // AS3: onStageResize(_arg_1:Event)
    private _onStageResize = (): void =>
    {
        if(this.disposed) return;

        this.layoutMainElements();
    };

    // AS3: onHideError(_arg_1:TimerEvent)
    private _onHideError = (): void =>
    {
        if(this._errorBalloon)
        {
            this._errorBalloon.visible = false;
        }
    };

    /**
     * AS3: onClose(_arg_1:Button)
     */
    private _onClose = (): void =>
    {
        if(this._closeButton)
        {
            this.removeChild(this._closeButton);
        }

        this._provider.closeCaptcha();
        this.showScreen(LoginFlow.SCREEN_LOGIN);
    };

    // AS3: hideViews()
    private hideViews(): void
    {
        if(!this._viewContainer) return;

        while(this._viewContainer.numChildren > 0)
        {
            this._viewContainer.removeChildAt(0);
        }
    }

    /**
     * AS3: showError(_arg_1:Object)
     *
     * Maps a web-API error code to a localisation key. The `default` arm is placed mid-switch in
     * the AS3 (between `facebook_disabled` and `access_token_required`), which changes nothing:
     * unmatched codes still fall to `generic.error`. The one code that does not produce a message
     * is `pocket.auth.facebook_not_connected`, whose arm is empty.
     */
    // AS3: .../src/login/LoginFlow.as::showError()
    private showError(error: unknown): void
    {
        const payload = error as {errors?: string[]; error?: string; message?: string} | null;
        const errors = payload?.errors;
        let code = errors && errors.length > 0 ? errors[0] : '';

        if(code === '' && payload != null)
        {
            if(payload.error != null)
            {
                code = payload.error;
            }
            else if(payload.message != null)
            {
                code = payload.message;
            }
        }

        let key = '';

        switch(code)
        {
            case 'invalid-captcha':
                this.showCaptchaError();

                return;

            case 'login.user_banned':
                key = 'connection.login.error.banned.desc';
                break;

            case 'login.blocked':
                key = 'connection.login.error.blocked.desc';
                break;

            case 'unauthorized-staff-login':
                key = 'connection.login.error.unauthorized.staff';
                break;

            case 'pocket.auth.login_failed':
                key = 'connection.login.error.-3.desc';
                break;

            // TS-only: `vortex-emulator`'s two second-factor answers. Both arrive here rather than
            // through a viewer callback of their own because the provider already funnels every
            // `/api/public/authentication/login` failure into `showInvalidLoginError()` — the error
            // string is all that separates them, and this switch is where it is read.
            //
            // Messages are literals for the same reason `RegisterView`'s are: no `pocket.auth`
            // second-factor key exists in any of the twelve `default_localizations*` embeds, and
            // those embeds are built from the dump, so adding one there would not survive.
            case 'pocket.auth.mfa_required':
                this._loginView?.requireCode();
                this.showErrorMessage('Enter the 6-digit code from your authenticator app.');

                return;

            case 'pocket.auth.invalid_code':
                this._loginView?.requireCode();
                this.showErrorMessage('That code is not right. Try the current one.');

                return;

            case 'pocket.auth.no_avatars':
                key = 'connection.login.missing_avatars';
                break;

            case 'pocket.auth.valid_email_required':
                key = 'connection.login.missing_credentials';
                break;

            case 'pocket.auth.password_required':
                key = 'connection.login.missing_credentials';
                break;

            case 'pocket.auth.facebook_disabled':
                key = 'connection.login.error.facebook_disabled.desc';
                break;

            case 'pocket.auth.access_token_required':
                key = 'connection.login.error.facebook_accesstoken.desc';
                break;

            case LoginFlow.ERROR_TYPE_IO_ERROR:
                key = 'connection.login.error.-400.desc';
                break;

            case 'account_issue':
                key = 'generic.error';
                break;

            case 'pocket.auth.facebook_not_connected':
                break;

            default:
                key = 'generic.error';
                break;
        }

        if(key && key.length > 0)
        {
            this.showErrorMessage(this._localization?.getLocalization(key) ?? key);
        }
    }

    /**
     * AS3: createFakeContext(_arg_1:Dictionary)
     *
     * AS3 also calls `loadDefaultEmbedLocalizations()` here. The port's `Component` base defers its
     * embedded-asset parse to a microtask, so no property is readable yet at this point — `mount()`
     * does it once that has settled.
     */
    // AS3: .../src/login/LoginFlow.as::createFakeContext()
    private createFakeContext(): void
    {
        this._fakeContext = new FakeContext();
        this._configuration = this.createConfiguration();
        this._localization = this.createLocalization();
        this._communication = this.createCommunication();
        LocalizedSprite.localizationManager = this._localization as unknown as ICoreLocalizationManager;
        LocalizedTextField.localizationManager = this._localization as unknown as ICoreLocalizationManager;
        this._provider = new WebApiLoginProvider(this);
        this._provider.on(WebApiLoginProvider.SSO_TOKEN_AVAILABLE, this._onSsoTokenAvailable);
    }

    /**
     * AS3: createConfiguration(_arg_1:IContext):HabboConfigurationManager
     *
     * Built from the embedded configuration library alone — no external_variables download. The
     * login screen only needs properties that ship inside the client (web.api, url.prefix,
     * live.environment.list, landing.view.background_*.uri), and reusing the engine's manager would
     * force the whole core to boot before the user has authenticated.
     */
    // AS3: .../src/login/LoginFlow.as::createConfiguration()
    private createConfiguration(): IHabboConfigurationManager
    {
        const configuration = new HabboConfigurationManager(this._fakeContext!);

        configuration.setEmbeddedConfigurationAssets(this._embeddedConfigurations);

        return configuration;
    }

    /**
     * AS3: createLocalization(_arg_1:IContext):HabboLocalizationManager
     *
     * AS3 builds this one from the embedded HabboLocalizationCom library, which is also where
     * `loadDefaultEmbedLocalizations()` finds its texts. The port is handed the same texts among
     * the embedded assets, so they are forwarded here — without them the screens render raw keys.
     */
    // AS3: .../src/login/LoginFlow.as::createLocalization()
    private createLocalization(): IHabboLocalizationManager
    {
        const localization = new HabboLocalizationManager(this._fakeContext!);

        localization.setConfigurationManager(this._configuration);
        localization.setEmbeddedLocalizationAssets(this._embeddedConfigurations);

        return localization;
    }

    // AS3: createCommunication(_arg_1:IContext):HabboCommunicationManager
    private createCommunication(): IHabboCommunicationManager
    {
        return new HabboCommunicationManager(this._fakeContext!);
    }

    // AS3: onSsoTokenAvailable(_arg_1:SsoTokenAvailableEvent)
    private _onSsoTokenAvailable = (token: string): void =>
    {
        this._ssoToken = token;
        this._loginEvents.emit(LoginFlow.LOGIN_FLOW_FINISHED_EVENT);
    };

    /**
     * TS-only: the deferred half of `createFakeContext()`.
     *
     * AS3 loads the embedded localisations inside the constructor because its asset libraries are
     * ready synchronously. Here the `Component` base defers its embedded-asset parse to a
     * microtask, so this runs after awaiting it — before any screen reads a property.
     */
    public async mount(): Promise<void>
    {
        await Promise.resolve();

        this._localization?.loadDefaultEmbedLocalizations(this.getProperty('environment.id') ?? 'en');
    }

    /**
     * AS3: dispose()
     *
     * The guard is AS3's: `dispose()` removes its frame listener, then returns early if it has
     * already run.
     */
    // AS3: .../src/login/LoginFlow.as::dispose()
    public dispose(): void
    {
        this.removeEventListener('enterFrame', this._onEnterFrame);

        if(this._disposed) return;

        if(this._fakeContext)
        {
            this._fakeContext.dispose();
            this._fakeContext = null;
        }

        if(this._background)
        {
            this.removeChild(this._background);
            this._background.dispose();
            this._background = null;
        }

        if(this._mainSprite != null)
        {
            this.removeChild(this._mainSprite);
            this._mainSprite = null;
        }

        this.hideViews();
        this._environmentView?.dispose();
        this._loginView?.dispose();
        this._registerView?.dispose();
        this._avatarView?.dispose();
        this._ssoTokenView?.dispose();
        this._captchaView?.dispose();
        this._captchaView = null;
        this._provider.off(WebApiLoginProvider.SSO_TOKEN_AVAILABLE, this._onSsoTokenAvailable);
        this._provider.dispose();
        this.stage?.removeEventListener('resize', this._onStageResize);
        this.stage?.removeChild(this);
        this._disposed = true;
        LocalizedSprite.localizationManager = null;
        LocalizedTextField.localizationManager = null;
        this._communication = null;
        this._localization = null;
    }
}
