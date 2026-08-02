/**
 * RegisterView
 *
 * TS-only: this screen has NO AS3 counterpart. `WIN63-202607011411-782849652/src/login/` holds ten
 * files and none of them registers an account — in the real client that happens on the website, and
 * a previous port of this project invented a `RegisterView` that traced to files in no dump, which
 * is why the 2026-07-31 rebuild deleted it.
 *
 * What is NOT invented here is everything the screen drives. `/api/public/registration/new` is a
 * declared AS3 route (`HabboWebApiMethod.REGISTER`, POST), `HabboWebApiSession.register()` is the
 * AS3 method that posts to it, `WebApiLoginProvider` already routes both its success arm
 * (`showSelectAvatar()`) and its failure arm (`showRegistrationError()`), and `vortex-emulator`
 * already implements the endpoint. The only thing the dump has no code for is a widget that calls
 * it — so that is all this file is, built from the same `onBoardingHcUi` widgets as `LoginView`,
 * whose structure it mirrors exactly.
 *
 * Captions are literals because no registration key exists in the twelve `default_localizations*`
 * embeds; the two field prompts reuse the keys that do (`connection.login.email` / `.password`).
 */
import {Logger} from '@core/utils/Logger';
import {Sprite} from '../onBoardingHcUi/display/DisplayObjectContainer';
import {Rectangle} from '../onBoardingHcUi/display/Geom';
import {Timer} from '../onBoardingHcUi/display/Timer';
import {ColouredButton} from '../onBoardingHcUi/ColouredButton';
import {InputField} from '../onBoardingHcUi/InputField';
import {LoaderUI} from '../onBoardingHcUi/LoaderUI';
import type {LocalizedTextField} from '../onBoardingHcUi/LocalizedTextField';
import type {ILoginContext} from './ILoginContext';

const log = Logger.getLogger('client.login.RegisterView');

export class RegisterView extends Sprite
{
    // TS-only: mirrors `LoginView._context`.
    private _context: ILoginContext;

    // TS-only: mirrors `LoginView._titleField`.
    private _titleField: LocalizedTextField | null = null;

    // TS-only: mirrors `LoginView._saveButton`.
    private _saveButton: ColouredButton | null = null;

    // TS-only: mirrors `LoginView._cancelButton`.
    private _cancelButton: ColouredButton | null = null;

    // TS-only: mirrors `LoginView._emailField`.
    private _emailField: InputField | null = null;

    // TS-only: mirrors `LoginView._passwordField`.
    private _passwordField: InputField | null = null;

    // TS-only: mirrors `LoginView._loginAreaWidth`.
    private _loginAreaWidth: number = 640;

    // TS-only: mirrors `LoginView._initialized`.
    private _initialized: boolean = false;

    constructor(context: ILoginContext)
    {
        super();

        this._context = context;
        this.addEventListener('addedToStage', this._onAddedToStage);
        this.init();
    }

    // TS-only: mirrors `LoginView.init()`.
    public init(): void
    {
        if(this._initialized) return;

        this._initialized = true;
        this.addTitleField();
        this.addInputFields();
        this.addButtons();
    }

    // TS-only: mirrors `LoginView.addButtons()` — same skins, same rectangles, same glow colour.
    public addButtons(): void
    {
        this._cancelButton = new ColouredButton(
            'red',
            '${generic.cancel}',
            new Rectangle(0, 300, 0, 40),
            true,
            this._onCancel,
            14211288
        );
        this.addChild(this._cancelButton);
        this._saveButton = new ColouredButton(
            'gfreen',
            'Create account',
            new Rectangle(0, 300, 0, 40),
            true,
            this._onRegister,
            14211288
        );
        this.addChild(this._saveButton);
    }

    // TS-only: mirrors `LoginView.addTitleField()`.
    private addTitleField(): void
    {
        if(this._titleField) return;

        this._titleField = LoaderUI.createTextField(
            'Create your account',
            40,
            16777215,
            false,
            true,
            false,
            false,
            'left'
        );
        this._titleField.x = 0;
        this._titleField.y = 0;
        this._titleField.width = 500;
        this._titleField.multiline = false;
        this._titleField.thickness = 50;
        this.addChild(this._titleField);
    }

    /**
     * TS-only: mirrors `LoginView.addInputFields()`, minus the stored-credential pre-fill — there is
     * nothing to restore for an account that does not exist yet.
     */
    private addInputFields(): void
    {
        this._emailField = new InputField(
            this._context,
            this._loginAreaWidth,
            '${connection.login.email}',
            '',
            '',
            ''
        );
        this.addChild(this._emailField);
        this._emailField.x = 0;
        this._emailField.y = 100;
        this._passwordField = new InputField(
            this._context,
            this._loginAreaWidth,
            '${connection.login.password}',
            '',
            '',
            '',
            true
        );
        this.addChild(this._passwordField);
    }

    // TS-only: mirrors `LoginView.onAddedToStage()` — the 20ms wait is what lets the anchors measure
    // fields that have already built themselves.
    private _onAddedToStage = (): void =>
    {
        const timer = new Timer(20, 1);

        timer.addEventListener('timerComplete', this._onAlignElements);
        timer.start();
    };

    // TS-only: mirrors `LoginView.onAlignElements()`.
    private _onAlignElements = (): void =>
    {
        if(!this._emailField || !this._passwordField || !this._saveButton || !this._cancelButton) return;

        LoaderUI.lineUpVertically(this._emailField, -20, this._passwordField);
        LoaderUI.alignAnchors(this._emailField, 0, 'l', this._passwordField);
        LoaderUI.alignAnchors(this._emailField, 0, 'r', this._saveButton);
        LoaderUI.lineUpHorizontallyRevers(this._saveButton, 20, this._cancelButton);
    };

    /**
     * TS-only: the counterpart of `LoginView.saveOutfit()`.
     *
     * The password is sent once; AS3's `register()` fills `passwordRepeated` from the same value, so
     * a confirmation box would have nothing to send.
     */
    private _onRegister = (): void =>
    {
        if(!this._emailField || !this._passwordField) return;

        // An empty field is not screened here on purpose: the endpoint answers a missing address or
        // password with `pocket.auth.missing_credentials`, which `LoginFlow.showError()` already
        // maps to a localised message. A local check would have to invent a second wording, and
        // `ILoginContext` deliberately does not expose `showErrorMessage()` to a view.
        log.debug('Registering a new account');
        this._context.initRegister(this._emailField.text, this._passwordField.text);
    };

    // TS-only: mirrors `LoginView.onCancel()` — back to the login screen this was opened from.
    private _onCancel = (): void =>
    {
        this._context.showScreen(2);
    };

    // TS-only: mirrors `LoginView.dispose()`.
    public dispose(): void
    {
        this._saveButton?.dispose();
        this._cancelButton?.dispose();
    }
}
