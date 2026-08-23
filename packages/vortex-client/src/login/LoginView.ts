/**
 * LoginView
 *
 * AS3: sources/WIN63-202607011411-782849652/src/login/LoginView.as
 *
 * The email/password screen (SCREEN_LOGIN = 2): a title, two input fields, and Cancel/Play. The
 * Play button starts inactive and is enabled by `ready()`, which the flow calls once
 * `/api/public/info/hello` has answered.
 *
 * Layout is not set here — it is done once, 20ms after the view reaches the stage, by
 * `onAlignElements()`, so the anchors measure fields that have already built themselves.
 */
import {Logger} from '@core/utils/Logger';
import {CommunicationUtils} from '@habbo/utils/CommunicationUtils';
import {Sprite} from '../onBoardingHcUi/display/DisplayObjectContainer';
import {Rectangle} from '../onBoardingHcUi/display/Geom';
import {Timer} from '../onBoardingHcUi/display/Timer';
import {ColouredButton} from '../onBoardingHcUi/ColouredButton';
import {InputField} from '../onBoardingHcUi/InputField';
import {LoaderUI} from '../onBoardingHcUi/LoaderUI';
import type {LocalizedTextField} from '../onBoardingHcUi/LocalizedTextField';
import type {ILoginContext} from './ILoginContext';

const log = Logger.getLogger('client.login.LoginView');

export class LoginView extends Sprite
{
    // AS3: _context
    private _context: ILoginContext;

    // AS3: _titleField
    private _titleField: LocalizedTextField | null = null;

    // AS3: _saveButton
    private _saveButton: ColouredButton | null = null;

    // AS3: _cancelButton
    private _cancelButton: ColouredButton | null = null;

    // TS-only: opens `RegisterView`; the 701 LoginView has no such button.
    private _registerButton: ColouredButton | null = null;

    // AS3: _emailField
    private _emailField: InputField | null = null;

    // AS3: _loginAreaWidth
    private _loginAreaWidth: number = 640;

    // AS3: _passwordField
    private _passwordField: InputField | null = null;

    // TS-only: the second-factor box. Null until the server asks for one — see `requireCode()`.
    private _codeField: InputField | null = null;

    // AS3: _initialized
    private _initialized: boolean = false;

    // AS3: LoginView(_arg_1:ILoginContext)
    constructor(context: ILoginContext)
    {
        super();

        this._context = context;
        this.addEventListener('addedToStage', this._onAddedToStage);
        this.init();
    }

    // AS3: init()
    public init(): void
    {
        if(this._initialized) return;

        this._initialized = true;
        this.addTitleField();
        this.addInputFields();
        this.addButtons();
    }

    /**
     * AS3: addButtons()
     *
     * Green is spelled "gfreen" in AS3 — see `ColouredButton`.
     */
    // AS3: .../src/login/LoginView.as::addButtons()
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
            '${connection.login.play}',
            new Rectangle(0, 300, 0, 40),
            true,
            this._saveOutfit,
            14211288
        );
        this._saveButton.active = false;
        this.addChild(this._saveButton);

        // TS-only: the dump's LoginView has two buttons. This third one is the only entry point to
        // `RegisterView` (see its header) — nothing in the 701 client opens a registration screen,
        // because there is none. No hitch skin is free for it: red is Cancel's on this very screen
        // and yellow carries the `hc_small` badge, so it takes green, the colour of going forward.
        // It sits at the far left of the row, away from Play, since the two must not be confused.
        this._registerButton = new ColouredButton(
            'gfreen',
            'Create account',
            new Rectangle(0, 300, 0, 40),
            true,
            this._onRegister,
            14211288
        );
        this.addChild(this._registerButton);
    }

    /**
     * AS3: ready()
     *
     * AS3 guards with `if(_saveButton != false)`, which is a truthiness test on the object.
     */
    // AS3: .../src/login/LoginView.as::ready()
    public ready(): void
    {
        if(this._saveButton)
        {
            this._saveButton.active = true;
        }
    }

    // AS3: addTitleField()
    private addTitleField(): void
    {
        if(this._titleField) return;

        this._titleField = LoaderUI.createTextField(
            '${connection.login.title}',
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
     * AS3: addInputFields()
     *
     * The email box is pre-filled from the stored login and the password box from the stored
     * password — AS3's `readSOLString("login")` / `restorePassword()`, which this port keeps in
     * `CommunicationUtils` under `readProperty()`.
     */
    // AS3: .../src/login/LoginView.as::addInputFields()
    private addInputFields(): void
    {
        this._emailField = new InputField(
            this._context,
            this._loginAreaWidth,
            '${connection.login.email}',
            CommunicationUtils.readProperty(CommunicationUtils.SOL_PROPERTY_LOGIN_NAME) ?? '',
            '${connection.login.missing_credentials}',
            ''
        );
        this.addChild(this._emailField);
        this._emailField.x = 0;
        this._emailField.y = 100;
        this._passwordField = new InputField(
            this._context,
            this._loginAreaWidth,
            '${connection.login.password}',
            CommunicationUtils.restorePassword() ?? '',
            '',
            '',
            true
        );
        this.addChild(this._passwordField);
    }

    /**
     * TS-only: reveals the second-factor box, once, after `/api/public/authentication/login` has
     * answered `pocket.auth.mfa_required` (or `invalid_code` on a retry).
     *
     * The field is built here rather than built hidden at `init()` because an `InputField` puts a
     * real DOM `<input>` over the canvas: a hidden one is still a focusable, autofillable element
     * the user can tab into, which is the same class of leak `unfocus()` exists to prevent. Nothing
     * to hide is simpler than something hidden.
     *
     * The prompt is a literal for the reason `RegisterView`'s captions are — no second-factor key
     * exists in the `default_localizations*` embeds, which are built from the dump.
     */
    public requireCode(): void
    {
        if(this._codeField || !this._passwordField) return;

        this._codeField = new InputField(
            this._context,
            this._loginAreaWidth,
            'Authentication code',
            '',
            '',
            ''
        );
        // `InputField` assumes a non-password box is the login one and announces `username` to the
        // browser; a one-time code is neither, and this is the setter that exists for that case.
        this._codeField.autoComplete = 'one-time-code';
        this.addChild(this._codeField);
        this._onAlignElements();
    }

    // AS3: onAddedToStage(_arg_1:Event)
    private _onAddedToStage = (): void =>
    {
        const timer = new Timer(20, 1);

        timer.addEventListener('timerComplete', this._onAlignElements);
        timer.start();
    };

    /**
     * AS3: onAlignElements(_arg_1:TimerEvent)
     */
    private _onAlignElements = (): void =>
    {
        if(!this._emailField || !this._passwordField || !this._saveButton || !this._cancelButton) return;

        LoaderUI.lineUpVertically(this._emailField, -20, this._passwordField);
        LoaderUI.alignAnchors(this._emailField, 0, 'l', this._passwordField);

        // TS-only: the code box continues the same chain when it exists — see `requireCode()`.
        if(this._codeField)
        {
            LoaderUI.lineUpVertically(this._passwordField, -20, this._codeField);
            LoaderUI.alignAnchors(this._emailField, 0, 'l', this._codeField);
        }
        LoaderUI.alignAnchors(this._emailField, 0, 'r', this._saveButton);
        LoaderUI.lineUpHorizontallyRevers(this._saveButton, 20, this._cancelButton);

        // TS-only: extends the AS3 chain by one, keeping its idiom — each button is placed to the
        // left of the previous one.
        if(this._registerButton)
        {
            LoaderUI.lineUpHorizontallyRevers(this._cancelButton, 20, this._registerButton);
        }
        log.debug(
            `(login) Buttons: ${[this._saveButton.x, this._saveButton.y, this._cancelButton.x, this._cancelButton.y]}`
        );
    };

    // AS3: saveOutfit(_arg_1:Button)
    private _saveOutfit = (): void =>
    {
        if(!this._emailField || !this._passwordField) return;

        this._context.initLogin(this._emailField.text, this._passwordField.text, this._codeField?.text);
    };

    // AS3: onCancel(_arg_1:Button)
    private _onCancel = (): void =>
    {
        this._context.showScreen(1);
    };

    // TS-only: opens `RegisterView` (SCREEN_REGISTER). The literal 5 matches how this file already
    // spells SCREEN_ENVIRONMENT above — the views take the interface, not `LoginFlow`.
    private _onRegister = (): void =>
    {
        this._context.showScreen(5);
    };

    // AS3: dispose()
    public dispose(): void
    {
        this._saveButton?.dispose();
        this._cancelButton?.dispose();
        this._registerButton?.dispose();
        // TS-only: an InputField owns a DOM <input>; the two AS3 ones are leaked here already, but
        // this one is created mid-session and must not outlive the view that made it.
        this._codeField?.dispose();
    }
}
