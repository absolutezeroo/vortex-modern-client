/**
 * TextInputParam — value object configuring a TextInputPreset: initial text, character limit,
 * placeholder, width, input restriction, editability, and tooltip.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/params/TextInputParam.as
 */
export class TextInputParam
{
    // AS3: TextInputParam.as::DEFAULT
    public static readonly DEFAULT: TextInputParam = new TextInputParam();

    // AS3: TextInputParam.as::initialText (backing field)
    private _initialText: string;

    // AS3: TextInputParam.as::_maxCharacters
    private _maxCharacters: number;

    // AS3: TextInputParam.as::placeholder (backing field)
    private _placeholder: string | null;

    // AS3: TextInputParam.as::_width
    private _width: number;

    // AS3: TextInputParam.as::restrict (backing field)
    private _restrict: string | null;

    // AS3: TextInputParam.as::editable (backing field)
    private _editable: boolean;

    // AS3: TextInputParam.as::tooltip (backing field)
    private _tooltip: string | null;

    // AS3: TextInputParam.as::TextInputParam()
    constructor(initialText: string = '', maxCharacters: number = 1000, placeholder: string | null = null, width: number = -1, restrict: string | null = null, editable: boolean = true, tooltip: string | null = null)
    {
        this._initialText = initialText;
        this._maxCharacters = maxCharacters;
        this._placeholder = placeholder;
        this._width = width;
        this._restrict = restrict;
        this._editable = editable;
        this._tooltip = tooltip;
    }

    // AS3: TextInputParam.as::get initialText()
    get initialText(): string
    {
        return this._initialText;
    }

    // AS3: TextInputParam.as::get maxCharacters()
    get maxCharacters(): number
    {
        return this._maxCharacters;
    }

    // AS3: TextInputParam.as::get placeholder()
    get placeholder(): string | null
    {
        return this._placeholder;
    }

    // AS3: TextInputParam.as::get width()
    get width(): number
    {
        return this._width;
    }

    // AS3: TextInputParam.as::get restrict()
    get restrict(): string | null
    {
        return this._restrict;
    }

    // AS3: TextInputParam.as::get editable()
    get editable(): boolean
    {
        return this._editable;
    }

    // AS3: TextInputParam.as::get tooltip()
    get tooltip(): string | null
    {
        return this._tooltip;
    }
}
