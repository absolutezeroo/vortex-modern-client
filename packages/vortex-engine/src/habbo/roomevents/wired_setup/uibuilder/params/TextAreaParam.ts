/**
 * TextAreaParam — value object configuring a TextAreaPreset: height, width, max lines, max chars per
 * line, total character limit, initial text, placeholder, edit restriction, editability, word wrap,
 * and tooltip.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/params/TextAreaParam.as
 */
export class TextAreaParam
{
    // AS3: TextAreaParam.as::height (backing field)
    private _height: number;

    // AS3: TextAreaParam.as::_width
    private _width: number;

    // AS3: TextAreaParam.as::_maxLines
    private _maxLines: number;

    // AS3: TextAreaParam.as::maxCharactersPerLine (backing field)
    private _maxCharactersPerLine: number;

    // AS3: TextAreaParam.as::_maxCharacters
    private _maxCharacters: number;

    // AS3: TextAreaParam.as::initialText (backing field)
    private _initialText: string;

    // AS3: TextAreaParam.as::placeholder (backing field)
    private _placeholder: string | null;

    // AS3: TextAreaParam.as::restrict (backing field)
    private _restrict: string | null;

    // AS3: TextAreaParam.as::editable (backing field)
    private _editable: boolean;

    // AS3: TextAreaParam.as::wordwrap (backing field)
    private _wordwrap: boolean;

    // AS3: TextAreaParam.as::tooltip (backing field)
    private _tooltip: string | null;

    // AS3: TextAreaParam.as::TextAreaParam()
    constructor(height: number, width: number = -1, maxLines: number = -1, maxCharactersPerLine: number = -1, maxCharacters: number = 1000, initialText: string = '', placeholder: string | null = null, restrict: string | null = null, editable: boolean = true, wordwrap: boolean = false, tooltip: string | null = null)
    {
        this._height = height;
        this._width = width;
        this._maxLines = maxLines;
        this._maxCharactersPerLine = maxCharactersPerLine;
        this._maxCharacters = maxCharacters;
        this._initialText = initialText;
        this._placeholder = placeholder;
        this._restrict = restrict;
        this._editable = editable;
        this._wordwrap = wordwrap;
        this._tooltip = tooltip;
    }

    // AS3: TextAreaParam.as::get height()
    get height(): number
    {
        return this._height;
    }

    // AS3: TextAreaParam.as::get width()
    get width(): number
    {
        return this._width;
    }

    // AS3: TextAreaParam.as::get maxLines()
    get maxLines(): number
    {
        return this._maxLines;
    }

    // AS3: TextAreaParam.as::get maxCharactersPerLine()
    get maxCharactersPerLine(): number
    {
        return this._maxCharactersPerLine;
    }

    // AS3: TextAreaParam.as::get maxCharacters()
    get maxCharacters(): number
    {
        return this._maxCharacters;
    }

    // AS3: TextAreaParam.as::get initialText()
    get initialText(): string
    {
        return this._initialText;
    }

    // AS3: TextAreaParam.as::get placeholder()
    get placeholder(): string | null
    {
        return this._placeholder;
    }

    // AS3: TextAreaParam.as::get editable()
    get editable(): boolean
    {
        return this._editable;
    }

    // AS3: TextAreaParam.as::get restrict()
    get restrict(): string | null
    {
        return this._restrict;
    }

    // AS3: TextAreaParam.as::get wordwrap()
    get wordwrap(): boolean
    {
        return this._wordwrap;
    }

    // AS3: TextAreaParam.as::get tooltip()
    get tooltip(): string | null
    {
        return this._tooltip;
    }
}
