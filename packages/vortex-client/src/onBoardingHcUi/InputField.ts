/**
 * InputField
 *
 * AS3: sources/WIN63-202607011411-782849652/src/onBoardingHcUi/InputField.as
 *
 * A labelled text box: a frame caption above, a nine-slice hitch background, a grey prompt that
 * disappears on first input, and the editable field itself. The login, SSO-token and (in
 * onboarding) name screens are all built out of these.
 */
import {Bitmap} from './display/Bitmap';
import type {DisplayEvent} from './display/DisplayObject';
import {Sprite} from './display/DisplayObjectContainer';
import {Rectangle} from './display/Geom';
import type {TextField} from './display/TextField';
import type {IUIContext} from './IUIContext';
import {LoaderUI} from './LoaderUI';
import type {LocalizedTextField} from './LocalizedTextField';
import {NineSplitSprite} from './NineSplitSprite';

export class InputField extends Sprite
{
    // AS3: _style — STYLE_HITCH
    private _style: number = 2;

    // AS3: _disposed
    private _disposed: boolean = false;

    // AS3: _context
    private _context: IUIContext | null;

    // AS3: _frame
    private _frame: Sprite | null = null;

    // AS3: _promptField
    private _promptField: LocalizedTextField | null = null;

    // AS3: _field
    private _field: LocalizedTextField | null = null;

    // AS3: _background
    private _background: Bitmap | null = null;

    // AS3: _inputClickedAlready
    private _inputClickedAlready: boolean = false;

    // AS3: _inputDefaultString
    private _inputDefaultString: string;

    // AS3: _dialogWidth
    private _dialogWidth: number;

    // AS3: _isPassword
    private _isPassword: boolean;

    // AS3: _caption
    private _caption: string;

    // AS3: _subCaption
    private _subCaption: string;

    // AS3: _maxWidth
    private _maxWidth: number = 0;

    // AS3: _prompt
    private _prompt: string;

    // AS3: InputField(_arg_1:IUIContext, _arg_2:int, _arg_3:String, _arg_4:String, _arg_5:String, _arg_6:String, _arg_7:Boolean=false)
    constructor(
        context: IUIContext,
        dialogWidth: number,
        prompt: string,
        inputDefaultString: string,
        caption: string,
        subCaption: string,
        isPassword: boolean = false
    )
    {
        super();

        this._context = context;
        this._dialogWidth = dialogWidth;
        this._prompt = prompt;
        this._inputDefaultString = inputDefaultString == null ? '' : inputDefaultString;
        this._caption = caption;
        this._subCaption = subCaption;
        this._isPassword = isPassword;
        this.init();
    }

    // AS3: get disposed():Boolean
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: get text():String
    public get text(): string
    {
        return this._field ? this._field.text : '';
    }

    /**
     * AS3: init()
     *
     * The frame's `y` is AS3's `-(int(-50 / 2))`, i.e. 25 — the caption sits above the box, so the
     * whole thing is pushed down to make room for it.
     */
    private init(): void
    {
        this._frame = LoaderUI.createFrame(
            this._caption,
            this._subCaption,
            new Rectangle(0, 0, this._dialogWidth, 1),
            this._style
        );
        this.addChild(this._frame);

        const backgroundHolder = new Sprite();

        this._background = new Bitmap(NineSplitSprite.INPUT_FIELD_HITCH.render(this._dialogWidth, 31));
        backgroundHolder.addChild(this._background);
        this._frame.addChild(backgroundHolder);
        backgroundHolder.x = 0;
        this._maxWidth = backgroundHolder.width - 30;

        this._promptField = LoaderUI.createTextField(this._prompt, 18, 6710886, true, false, false, false);
        this._promptField.alpha = 0.8;
        this._promptField.x = backgroundHolder.x + 16;
        this._promptField.y = backgroundHolder.y + Math.trunc((backgroundHolder.height - this._promptField.height) / 2);
        this._promptField.width = this._maxWidth;
        this._promptField.visible = this._inputDefaultString == null || this._inputDefaultString.length === 0;
        this._frame.addChild(this._promptField);

        this._field = LoaderUI.createTextField(this._inputDefaultString, 18, 6710886, true, false, true, false);
        this._field.displayAsPassword = this._isPassword;

        // TS-only: what the stage's `<input>` announces to the browser's password manager. Flash
        // stored the credentials itself (`CommunicationUtils.restorePassword()`, still the source of
        // `_inputDefaultString` above), so AS3 has nothing to port here.
        this._field.autoComplete = this._isPassword ? 'current-password' : 'username';
        this._frame.addChild(this._field);
        this._field.x = backgroundHolder.x + 16;
        this._field.y = backgroundHolder.y + Math.trunc((backgroundHolder.height - this._field.height) / 2);
        this._field.width = this._maxWidth;
        this._field.addEventListener('click', this._onInputClicked);
        this._field.addEventListener('change', this._onInputChange);

        if(!this._inputDefaultString || this._inputDefaultString.length === 0)
        {
            this._field.autoSize = false;
            this._field.width = this._maxWidth;
        }

        backgroundHolder.addEventListener('click', this._onInputBackgroundClicked);
        this._frame.y = 25;
    }

    /**
     * AS3: onInputChange(_arg_1:Event)
     *
     * Re-broadcasts the change off the InputField itself, which is what `SsoTokenView` listens to.
     */
    private _onInputChange = (event: DisplayEvent | null): void =>
    {
        if(!this._field || !this._promptField) return;

        this._promptField.visible = this._field.text.length === 0;

        if(this._field.width > this._maxWidth)
        {
            this._field.autoSize = false;
            this._field.width = this._maxWidth;
        }

        if(event != null)
        {
            this.dispatchEvent(event.clone());
        }
    };

    /**
     * AS3: onInputBackgroundClicked(_arg_1:MouseEvent)
     */
    private _onInputBackgroundClicked = (): void =>
    {
        if(!this._context || !this._field) return;

        const stage = this._context.stage;

        if(stage)
        {
            stage.focus = this._field;
        }

        this._onInputClicked(null);
    };

    /**
     * AS3: onInputClicked(_arg_1:Event)
     *
     * Flash focuses an input TextField on click by itself; this runtime paints the glyphs and parks
     * a `<input>` over the focused field instead, so the focus assignment is explicit here — AS3
     * only had to do it from the background sprite.
     */
    private _onInputClicked = (event: DisplayEvent | null): void =>
    {
        if(event != null && this._context && this._field)
        {
            const stage = this._context.stage;

            if(stage)
            {
                stage.focus = this._field;
            }
        }

        if(this._inputClickedAlready) return;

        if(!this._promptField || !this._field) return;

        this._promptField.visible = false;
        this._inputClickedAlready = true;
        this._field.textColor = this._style === 2 ? 6710886 : 0;
        this._field.removeEventListener('click', this._onInputClicked);
        this._onInputChange(null);
    };

    /**
     * TS-only: the field this input types into, so a view can hand it to `stage.focus` — AS3 did
     * that through `_context.stage.focus` from inside the widget.
     */
    public get field(): TextField | null
    {
        return this._field;
    }

    // AS3: dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        if(this._frame)
        {
            this.removeChild(this._frame);
        }

        this._field = null;
        this._promptField = null;
        this._background = null;
        this._frame = null;
        this._context = null;
        this._disposed = true;
    }
}
