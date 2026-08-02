/**
 * SsoTokenView
 *
 * AS3: sources/WIN63-202607011411-782849652/src/login/SsoTokenView.as
 *
 * The screen the login flow opens on (SCREEN_SSO_TOKEN = 4): paste a ticket of the form
 * `hh<env>.<uuid>.<uuid>` and play. Every keystroke re-validates it, and a valid one previews the
 * ticket's environment (localisation only) before anything is committed.
 *
 * Note this view takes `LoginFlow`, not `ILoginContext` — it calls `updateEnvironment()`, which is
 * not part of the interface.
 */
import {Logger} from '@core/utils/Logger';
import {Sprite} from '../onBoardingHcUi/display/DisplayObjectContainer';
import type {DisplayKeyboardEvent} from '../onBoardingHcUi/display/DisplayObject';
import {Rectangle} from '../onBoardingHcUi/display/Geom';
import {Timer} from '../onBoardingHcUi/display/Timer';
import {ColouredButton} from '../onBoardingHcUi/ColouredButton';
import {InputField} from '../onBoardingHcUi/InputField';
import {LoaderUI} from '../onBoardingHcUi/LoaderUI';
import type {LocalizedTextField} from '../onBoardingHcUi/LocalizedTextField';
import type {LoginFlow} from './LoginFlow';

const log = Logger.getLogger('client.login.SsoTokenView');

export class SsoTokenView extends Sprite
{
    // AS3: _context
    private _context: LoginFlow;

    // AS3: _titleField
    private _titleField: LocalizedTextField | null = null;

    // AS3: _saveButton
    private _saveButton: ColouredButton | null = null;

    // AS3: _cancelButton
    private _cancelButton: ColouredButton | null = null;

    // AS3: _loginAreaWidth
    private _loginAreaWidth: number = 640;

    // AS3: _tokenField
    private _tokenField: InputField | null = null;

    // AS3: _initialized
    private _initialized: boolean = false;

    // AS3: SsoTokenView(_arg_1:LoginFlow)
    constructor(context: LoginFlow)
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

    // AS3: addButtons()
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
            this._onLogin,
            14211288
        );
        this._saveButton.active = false;
        this.addChild(this._saveButton);
    }

    // AS3: ready()
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

    // AS3: addInputFields()
    private addInputFields(): void
    {
        this._tokenField = new InputField(
            this._context,
            this._loginAreaWidth,
            '${connection.login.code.prompt}',
            '',
            '${connection.login.useTicket}',
            '',
            true
        );
        this.addChild(this._tokenField);
        this._tokenField.addEventListener('change', this._onInputChange);
        this._tokenField.addEventListener('keyDown', this._onInputKeyboardEvent);
        this._tokenField.x = 0;
        this._tokenField.y = 100;
    }

    /**
     * AS3: validateToken(_arg_1:Vector.<String>):Boolean
     *
     * A ticket is `<env>.<uuid>.<uuid>` with an optional fourth segment. The environment prefix
     * has `hh` stripped and two aliases remapped (`br` → `pt`, `us` → `en`). On success the vector
     * comes back as [environment, first, second].
     */
    private validateToken(parts: string[]): boolean
    {
        if(!this._tokenField) return false;

        const value = this._tokenField.text;

        if(!value) return false;

        if(value.length === 0) return false;

        const segments = value.split('.');

        if(segments.length !== 3 && segments.length !== 4) return false;

        let environment = String(segments[0]).replace('hh', '');

        environment = environment.replace('br', 'pt');
        environment = environment.replace('us', 'en');
        parts.push(environment);
        parts.push(segments[1]);
        parts.push(segments[2]);

        return true;
    }

    // AS3: onAddedToStage(_arg_1:Event)
    private _onAddedToStage = (): void =>
    {
        const timer = new Timer(20, 1);

        timer.addEventListener('timerComplete', this._onAlignElements);
        timer.start();
    };

    // AS3: onAlignElements(_arg_1:TimerEvent)
    private _onAlignElements = (): void =>
    {
        if(!this._tokenField || !this._saveButton || !this._cancelButton) return;

        LoaderUI.alignAnchors(this._tokenField, 0, 'r', this._saveButton);
        LoaderUI.alignAnchors(this._saveButton, -20 - this._cancelButton.width, 'l', this._cancelButton);
        log.debug(
            `(login) Buttons: ${[this._saveButton.x, this._saveButton.y, this._cancelButton.x, this._cancelButton.y]}`
        );
    };

    // AS3: onInputKeyboardEvent(_arg_1:KeyboardEvent)
    private _onInputKeyboardEvent = (event: DisplayKeyboardEvent): void =>
    {
        if(event.charCode !== 13) return;

        if(this._saveButton && this._saveButton.active)
        {
            this._onLogin();
        }
    };

    /**
     * AS3: onInputChange(_arg_1:Event)
     *
     * The `true` on `updateEnvironment` is AS3's preview flag: only the localisation is reloaded,
     * nothing is written to storage and no host parameters change.
     */
    private _onInputChange = (): void =>
    {
        const parts: string[] = [];

        if(this.validateToken(parts))
        {
            this._context.updateEnvironment(parts[0], true);

            if(this._saveButton)
            {
                this._saveButton.active = true;
            }

            return;
        }

        if(this._saveButton)
        {
            this._saveButton.active = false;
        }
    };

    // AS3: onLogin(_arg_1:Button)
    private _onLogin = (): void =>
    {
        const parts: string[] = [];

        if(this.validateToken(parts))
        {
            this._context.initLoginWithSsoToken(parts[0], `${parts[1]}.${parts[2]}`);

            return;
        }

        if(this._saveButton)
        {
            this._saveButton.active = false;
        }
    };

    // AS3: onCancel(_arg_1:Button)
    private _onCancel = (): void =>
    {
        this._context.showScreen(1);
    };

    // AS3: dispose()
    public dispose(): void
    {
        if(this._tokenField)
        {
            this._tokenField.removeEventListener('change', this._onInputChange);
        }
    }
}
