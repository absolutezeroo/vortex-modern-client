/**
 * TextParam — value object configuring a TextPreset: layout mode (stretch/multiline/overflow),
 * bold/underline, max lines, alignment, and optional font-size / text-colour overrides.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/params/TextParam.as
 */
export class TextParam
{
    // AS3: TextParam.as::NO_COLOR_OVERRIDE
    public static readonly NO_COLOR_OVERRIDE: number = 0;

    // AS3: TextParam.as::MODE_STRETCH
    public static readonly MODE_STRETCH: number = 0;

    // AS3: TextParam.as::MODE_MULTILINE
    public static readonly MODE_MULTILINE: number = 1;

    // AS3: TextParam.as::MODE_OVERFLOW
    public static readonly MODE_OVERFLOW: number = 2;

    // AS3: TextParam.as::DEFAULT
    public static readonly DEFAULT: TextParam = new TextParam(1, false);

    // AS3: TextParam.as::_mode
    private _mode: number;

    // AS3: TextParam.as::bold (backing field)
    private _bold: boolean;

    // AS3: TextParam.as::_maxLines
    private _maxLines: number;

    // AS3: TextParam.as::underline (backing field)
    private _underline: boolean;

    // AS3: TextParam.as::alignment (backing field)
    private _alignment: string | null;

    // AS3: TextParam.as::fontSize (backing field)
    private _fontSize: number = -1;

    // AS3: TextParam.as::_textColor
    private _textColor: number = 0;

    // AS3: TextParam.as::TextParam()
    constructor(mode: number, bold: boolean = false, maxLines: number = 0, underline: boolean = false, alignment: string | null = null)
    {
        this._mode = mode;
        this._bold = bold;
        this._maxLines = maxLines;
        this._underline = underline;
        this._alignment = alignment;
    }

    // AS3: TextParam.as::get mode()
    get mode(): number
    {
        return this._mode;
    }

    // AS3: TextParam.as::get bold()
    get bold(): boolean
    {
        return this._bold;
    }

    // AS3: TextParam.as::get maxLines()
    get maxLines(): number
    {
        return this._maxLines;
    }

    // AS3: TextParam.as::get underline()
    get underline(): boolean
    {
        return this._underline;
    }

    // AS3: TextParam.as::get alignment()
    get alignment(): string | null
    {
        return this._alignment;
    }

    // AS3: TextParam.as::get fontSize()
    get fontSize(): number
    {
        return this._fontSize;
    }

    // AS3: TextParam.as::set fontSize()
    set fontSize(value: number)
    {
        this._fontSize = value;
    }

    // AS3: TextParam.as::get textColor()
    get textColor(): number
    {
        return this._textColor;
    }

    // AS3: TextParam.as::set textColor()
    set textColor(value: number)
    {
        this._textColor = value;
    }
}
