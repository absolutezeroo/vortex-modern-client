/**
 * Text node of the login display list.
 *
 * TS-only: stand-in for `flash.text.TextField` + `flash.text.TextFormat`, holding what
 * `LoaderUI.createTextField()` configures and what the views then read back.
 *
 * Two Flash behaviours are load-bearing and reproduced rather than approximated:
 * - `textWidth`/`textHeight` are the measured ink, and `LoaderUI` lays the whole login screen out
 *   from them (`alignAnchors`, `lineUpVertically`, and `Button`'s caption centring). Assigning
 *   `width = textWidth` after `autoSize` is AS3 stripping Flash's 2px gutter, so the port measures
 *   without one.
 * - `antiAliasType = "advanced"` — deliberately NOT routed through the engine's glyph atlas. The
 *   atlas exists for Flash's `"normal"` rasteriser; `"advanced"` text stays on `fillText()`, which
 *   is also what the atlas itself documents (see `core/window/utils/GlyphAtlas.ts`).
 */
import {DisplayObject} from './DisplayObject';
import {Rectangle} from './Geom';

/** TS-only: `flash.text.TextFormat`, as far as `LoaderUI.createTextField()` fills it in. */
export interface ITextFormat
{
    font: string;
    size: number;
    color: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    align: 'left' | 'center' | 'right';
    kerning: boolean;
}

export class TextField extends DisplayObject
{
    /** TS-only: the glyph Flash substitutes for every character of a `displayAsPassword` field. */
    public static readonly PASSWORD_MASK: string = '*';

    /** TS-only: shared measuring surface — one context for every field. */
    private static _measureContext: OffscreenCanvasRenderingContext2D | null = null;

    private _format: ITextFormat;
    private _text: string = '';
    private _multiline: boolean = false;
    private _wordWrap: boolean = false;
    private _width: number = 0;
    private _height: number = 0;
    private _autoSize: boolean = false;
    private _lines: string[] = [];
    private _measured: boolean = false;

    /** AS3: `type` — "input" makes the field editable. */
    public isInput: boolean = false;

    /** AS3: `selectable`. */
    public selectable: boolean = false;

    /** AS3: `displayAsPassword`. */
    public displayAsPassword: boolean = false;

    /**
     * AS3: `thickness` — an `"advanced"` anti-aliasing knob. Stored so the AS3 assignments in
     * `addTitleField()` keep meaning something, but Canvas2D has no equivalent control, so it does
     * not affect the raster.
     */
    public thickness: number = 0;

    /** AS3: `maxChars`. */
    public maxChars: number = 0;

    /**
     * TS-only: no AS3 counterpart — Flash had no password manager. The token the stage puts on the
     * `<input>` it parks over this field, so the browser knows what it is holding
     * ("current-password", "username", "off"). `InputField` sets it; everything else stays "on".
     */
    public autoComplete: AutoFill = 'on';

    constructor(format: ITextFormat)
    {
        super();

        this._format = format;
    }

    /** TS-only: `get defaultTextFormat()` / `set defaultTextFormat()`. */
    public get format(): ITextFormat
    {
        return this._format;
    }

    public set format(value: ITextFormat)
    {
        this._format = value;
        this._measured = false;
    }

    /** AS3: `get text()` / `set text()`. */
    public get text(): string
    {
        return this._text;
    }

    public set text(value: string)
    {
        const next = value ?? '';

        if(this._text === next) return;

        this._text = next;
        this._measured = false;
    }

    /**
     * AS3: `set htmlText()` — the captions arrive as `"${connection.login.title}"` or as localised
     * markup, so tags are stripped and the handful of entities Habbo's texts use are decoded.
     */
    public set htmlText(value: string)
    {
        this.text = TextField.stripHtml(value);
    }

    /** AS3: `get textColor()` / `set textColor()`. */
    public get textColor(): number
    {
        return this._format.color;
    }

    public set textColor(value: number)
    {
        this._format = {...this._format, color: value};
    }

    /** AS3: `get multiline()` / `set multiline()`. */
    public get multiline(): boolean
    {
        return this._multiline;
    }

    public set multiline(value: boolean)
    {
        this._multiline = value;
        this._measured = false;
    }

    /** AS3: `get wordWrap()` / `set wordWrap()`. */
    public get wordWrap(): boolean
    {
        return this._wordWrap;
    }

    public set wordWrap(value: boolean)
    {
        this._wordWrap = value;
        this._measured = false;
    }

    /**
     * AS3: `get autoSize()` / `set autoSize()` — only `"left"` and `"none"` occur in the login
     * flow, so the port keeps it as a flag: on, the field reports its measured ink.
     */
    public get autoSize(): boolean
    {
        return this._autoSize;
    }

    public set autoSize(value: boolean)
    {
        this._autoSize = value;
        this._measured = false;
    }

    /** AS3: `get textWidth()` — measured ink width, no gutter. */
    public get textWidth(): number
    {
        this.measure();

        let widest = 0;

        for(const line of this._lines)
        {
            widest = Math.max(widest, TextField.measureLine(line, this._format));
        }

        return Math.ceil(widest);
    }

    /** AS3: `get textHeight()` — measured ink height, no gutter. */
    public get textHeight(): number
    {
        this.measure();

        return Math.ceil(this._lines.length * this.lineHeight);
    }

    /**
     * TS-only: `width` is a laid-out box, not a scale. Flash resizes a TextField's box on
     * assignment (the text reflows inside it) instead of scaling the glyphs, and the views assign
     * it constantly (`_titleField.width = 500`, `_field.width = _maxWidth`).
     */
    public override get width(): number
    {
        if(this._autoSize && this._width === 0) return this.textWidth * this._scaleX;

        return this._width * this._scaleX;
    }

    public override set width(value: number)
    {
        this._width = value;
        this._measured = false;
    }

    /** TS-only: `height`, same reasoning as `width`. */
    public override get height(): number
    {
        if(this._height === 0) return this.textHeight * this._scaleY;

        return this._height * this._scaleY;
    }

    public override set height(value: number)
    {
        this._height = value;
    }

    /** TS-only: line height used for both measuring and drawing. */
    public get lineHeight(): number
    {
        return Math.ceil(this._format.size * 1.2);
    }

    public getContentBounds(): Rectangle
    {
        return new Rectangle(0, 0, this.width / (this._scaleX || 1), this.height / (this._scaleY || 1));
    }

    /**
     * TS-only: Flash's rule that a text field which is neither editable nor selectable is
     * transparent to the mouse — the click falls through to whatever is behind it.
     *
     * `LoaderUI.createTextField()` sets `selectable = param6` alongside `type`, so every label in
     * this tree is a non-selectable dynamic field and every editable box is a selectable input one.
     * AS3 leans on that: `InputField` puts no click handler on its caption or its prompt, and
     * focuses itself from the sprite BEHIND them (`onInputBackgroundClicked()`), which only ever
     * runs if the click reaches that sprite.
     *
     * Without it a bounding-box hit test hands the press to the nearest label, and the labels here
     * are wide: `LoaderUI.createFrame()` gives a STYLE_HITCH caption `width = param3.width` — the
     * full dialog width, 640px, even when the caption is the empty string. The password field's
     * caption is laid over the email field's box that way (`lineUpVertically(_emailField, -20,
     * _passwordField)`), so the lower two thirds of the email box answered with a label that is not
     * an input, and `Stage.onMouseDown()` read that as "focus nothing" — a click that blurred the
     * field instead of focusing it.
     */
    public override hitTest(localX: number, localY: number): DisplayObject | null
    {
        if(!this.isInput && !this.selectable) return null;

        return super.hitTest(localX, localY);
    }

    /**
     * TS-only: the CSS font string for this field's format.
     */
    public get cssFont(): string
    {
        return TextField.toCssFont(this._format);
    }

    /**
     * TS-only: text as it is painted — password fields show asterisks, as in Flash.
     */
    public get displayText(): string
    {
        if(!this.displayAsPassword) return this._text;

        return TextField.PASSWORD_MASK.repeat(this._text.length);
    }

    /**
     * TS-only: the advance of `text` in this field's own format.
     *
     * The stage needs it to reconcile what it paints with what the `<input>` it parks over the
     * field lays out — see `Stage.positionInputElement()`.
     */
    public measureString(text: string): number
    {
        return TextField.measureLine(text, this._format);
    }

    protected draw(context: CanvasRenderingContext2D): void
    {
        this.measure();

        if(this._lines.length === 0) return;

        const format = this._format;
        const red = (format.color >> 16) & 0xFF;
        const green = (format.color >> 8) & 0xFF;
        const blue = format.color & 0xFF;

        context.font = this.cssFont;
        context.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        context.textBaseline = 'alphabetic';
        context.textAlign = 'left';

        const lineHeight = this.lineHeight;
        const ascent = Math.round(format.size * 0.8);
        const boxWidth = this._width > 0 ? this._width : this.textWidth;

        for(let i = 0; i < this._lines.length; i++)
        {
            const line = this._lines[i];
            const y = i * lineHeight + ascent;
            let x = 0;

            if(format.align === 'center')
            {
                x = (boxWidth - TextField.measureLine(line, format)) / 2;
            }
            else if(format.align === 'right')
            {
                x = boxWidth - TextField.measureLine(line, format);
            }

            context.fillText(line, x, y);

            if(format.underline)
            {
                const lineWidth = TextField.measureLine(line, format);

                context.fillRect(x, y + 2, lineWidth, 1);
            }
        }
    }

    /**
     * TS-only: splits the text into painted lines, honouring `multiline` and `wordWrap`.
     */
    private measure(): void
    {
        if(this._measured) return;

        this._measured = true;

        const source = this.displayText;

        if(source.length === 0)
        {
            // Flash still counts one (empty) line in an empty field, so `textHeight`/`height` report
            // a line's worth rather than zero. `InputField.init()` centres its box against exactly
            // that (`y = int((background.height - _field.height) / 2)`), so a zero-height field
            // parked the typed text at the bottom edge of the input instead of in the middle of it.
            this._lines = [''];

            return;
        }

        if(!this._multiline)
        {
            this._lines = [source.replace(/\r?\n/g, ' ')];

            return;
        }

        const paragraphs = source.split(/\r?\n/);

        if(!this._wordWrap || this._width <= 0)
        {
            this._lines = paragraphs;

            return;
        }

        const lines: string[] = [];

        for(const paragraph of paragraphs)
        {
            const words = paragraph.split(' ');
            let current = '';

            for(const word of words)
            {
                const candidate = current.length === 0 ? word : `${current} ${word}`;

                if(TextField.measureLine(candidate, this._format) <= this._width || current.length === 0)
                {
                    current = candidate;

                    continue;
                }

                lines.push(current);
                current = word;
            }

            lines.push(current);
        }

        this._lines = lines;
    }

    /** TS-only: CSS font string for a format. */
    private static toCssFont(format: ITextFormat): string
    {
        const style = format.italic ? 'italic ' : '';
        const weight = format.bold ? 'bold ' : '';

        return `${style}${weight}${format.size}px '${format.font}', Arial, Helvetica, sans-serif`;
    }

    /** TS-only: measures one line through the shared context. */
    private static measureLine(line: string, format: ITextFormat): number
    {
        if(line.length === 0) return 0;

        if(!TextField._measureContext)
        {
            const canvas = new OffscreenCanvas(1, 1);

            TextField._measureContext = canvas.getContext('2d');
        }

        const context = TextField._measureContext;

        if(!context) return line.length * format.size * 0.5;

        context.font = TextField.toCssFont(format);

        return context.measureText(line).width;
    }

    /** TS-only: tag stripping + the entities Habbo's localisation texts use. */
    private static stripHtml(value: string): string
    {
        if(!value) return '';

        return value
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"');
    }
}
