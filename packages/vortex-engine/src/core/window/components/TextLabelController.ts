import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {ILabelWindow} from './ILabelWindow';
import {WindowController} from '../WindowController';
import {WindowEvent} from '../events/WindowEvent';
import type {PropertyStruct} from '../utils/PropertyStruct';
import {TextStyleManager} from '../utils/TextStyleManager';
import {resolveLocalizationTokens} from '../utils/WindowParser';
import {quoteFontFamilyList, measureFontLineHeight} from '../utils/CanvasFontString';
import {GlyphAtlas} from '../utils/GlyphAtlas';

/**
 * Controller for label windows.
 *
 * A lightweight text display that uses shared TextFieldCache instances
 * rather than owning a dedicated TextField. Unlike TextController,
 * this extends WindowController directly per AS3.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextLabelController.as
 */
export class TextLabelController extends WindowController implements ILabelWindow
{
    /**
	 * Shared canvas for text measurement.
	 */
    private static _measureCtx: OffscreenCanvasRenderingContext2D | null = null;
    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::_textStyleName
    private _textStyleName: string = '';
    private _refreshing: boolean = false;
    private _marginLeft: number = 0;
    private _marginTop: number = 0;
    private _marginRight: number = 0;
    private _marginBottom: number = 0;
    private _spacing: number = 0;
    private _leading: number = 0;

    /**
	 * Flash text-quality settings for this label's shared TextField.
	 *
	 * AS3 does not store these on the controller: `TextFieldCache.getTextField()`
	 * stamps them onto the pooled `flash.text.TextField` from the resolved
	 * style, and the controller's getters read them straight back off it
	 * (TextLabelController.as l.50, 95, 129, 174). This port has no pooled
	 * TextField, so the same four values live here instead — with AS3's own
	 * defaults, which is why gridFitType starts at "pixel"
	 * (TextFieldCache.as l.52) rather than being style-driven.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/utils/TextFieldCache.as::getTextField()
    private _antiAliasType: string = 'advanced';
    private _gridFitType: string = 'pixel';
    private _sharpness: number = 0;
    private _thickness: number = 0;

    constructor(
        name: string,
        type: number,
        style: number,
        param: number,
        context: IWindowContext,
        rect: { x: number; y: number; width: number; height: number },
        parent: IWindow | null = null,
        procedure: ((event: WindowEvent, window: IWindow) => void) | null = null,
        tags: string[] | null = null,
        properties: unknown[] | null = null,
        id: number = 0,
        dynamicStyle: string = ''
    )
    {
        super(name, type, style, param, context, rect, parent, procedure, tags, properties, id, dynamicStyle);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextLabelController.as::TextLabelController()
    protected override finalize(): void
    {
        super.finalize();

        this._hasVisualContent = true;
    }

    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::_text
    private _text: string = '';

    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::get text()
    public get text(): string
    {
        return this._text;
    }

    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::set text()
    public set text(value: string)
    {
        if(value == null) return;

        this._text = resolveLocalizationTokens(value);
        this._caption = this._text;
        this.refresh();
    }

    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::_textColor
    private _textColor: number | null = null;

    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::get textColor()
    public get textColor(): number
    {
        return this._textColor ?? 0;
    }

    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::set textColor()
    public set textColor(value: number)
    {
        if(value !== this._textColor)
        {
            this._textColor = value;
            this.refresh();
        }
    }

    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::_textWidth
    private _textWidth: number = 0;

    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::get textWidth()
    public get textWidth(): number
    {
        return this._textWidth;
    }

    private _textHeight: number = 0;

    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::get textHeight()
    public get textHeight(): number
    {
        return this._textHeight;
    }

    private _vertical: boolean = false;

    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::get vertical()
    public get vertical(): boolean
    {
        return this._vertical;
    }

    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::set vertical()
    public set vertical(value: boolean)
    {
        this._vertical = value;
        this.refresh();
    }

    private _fontFace: string = '';

    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::get fontFace()
    public get fontFace(): string
    {
        return this._fontFace;
    }

    private _fontSize: number = 12;

    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::get fontSize()
    public get fontSize(): number
    {
        return this._fontSize;
    }

    private _bold: boolean = false;

    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::get bold()
    public get bold(): boolean
    {
        return this._bold;
    }

    private _italic: boolean = false;

    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::get italic()
    public get italic(): boolean
    {
        return this._italic;
    }

    private _underline: boolean = false;

    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::get underline()
    public get underline(): boolean
    {
        return this._underline;
    }

    private _etchingColor: number = 0;

    public get etchingColor(): number
    {
        return this._etchingColor;
    }

    private _etchingPosition: string = 'bottom';

    public get etchingPosition(): string
    {
        return this._etchingPosition;
    }

    public override get caption(): string
    {
        return this._text;
    }

    public override set caption(value: string)
    {
        this.text = value;
    }

    /**
	 * Whether a text color has been explicitly set.
	 */
    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::get hasTextColor()
    public get hasTextColor(): boolean
    {
        return this._textColor !== null;
    }

    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::get textBackground()
    public get textBackground(): boolean
    {
        return this.background;
    }

    public set textBackground(value: boolean)
    {
        this.background = value;
    }

    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::get textBackgroundColor()
    public get textBackgroundColor(): number
    {
        return this.color;
    }

    public set textBackgroundColor(value: number)
    {
        this.color = value;
    }

    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::get length()
    public get length(): number
    {
        return this._text.length;
    }

    /**
	 * Draw offset X (margin left).
	 */
    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::get drawOffsetX()
    public get drawOffsetX(): number
    {
        return this._marginLeft;
    }

    /**
	 * Draw offset Y (margin top).
	 */
    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::get drawOffsetY()
    public get drawOffsetY(): number
    {
        return this._marginTop;
    }

    public override get properties(): unknown[]
    {
        const props = super.properties;

        props.push(this.createProperty('text_style', this._textStyleName));
        props.push(this.createProperty('text_color', this._textColor ?? 0));
        props.push(this.createProperty('vertical', this._vertical));
        props.push(this.createProperty('margin_left', this._marginLeft));
        props.push(this.createProperty('margin_top', this._marginTop));
        props.push(this.createProperty('margin_right', this._marginRight));
        props.push(this.createProperty('margin_bottom', this._marginBottom));

        return props;
    }

    public override set properties(value: unknown[])
    {
        for(const item of value)
        {
            const prop = item as PropertyStruct;

            switch(prop.key)
            {
                case 'text_style':
                {
                    this._textStyleName = prop.value as string;

                    const resolved = TextStyleManager.getStyle(this._textStyleName);

                    if(resolved)
                    {
                        if(resolved.fontFamily != null) this._fontFace = resolved.fontFamily;
                        if(resolved.fontSize != null) this._fontSize = resolved.fontSize;
                        if(resolved.fontWeight === 'bold') this._bold = true;
                        if(resolved.fontStyle === 'italic') this._italic = true;
                        if(resolved.textDecoration === 'underline') this._underline = true;
                        if(resolved.color != null && this._textColor === null) this._textColor = resolved.color;
                        if(resolved.etchingColor != null) this._etchingColor = resolved.etchingColor;
                        if(resolved.etchingPosition != null) this._etchingPosition = resolved.etchingPosition;
                        if(resolved.letterSpacing != null) this._spacing = resolved.letterSpacing;
                        if(resolved.leading != null) this._leading = resolved.leading;

                        // AS3: TextFieldCache.as::getTextField() l.51-54 —
                        // anything but "normal" is coerced to "advanced", and
                        // sharpness/thickness fall back to 0 when the style
                        // leaves them unset.
                        this._antiAliasType = resolved.antiAliasType === 'normal' ? 'normal' : 'advanced';
                        this._sharpness = resolved.sharpness ?? 0;
                        this._thickness = resolved.thickness ?? 0;
                    }

                    break;
                }
                case 'text_color':
                    this._textColor = prop.value as number;
                    break;
                case 'margin_left':
                    this._marginLeft = prop.value as number;
                    break;
                case 'margin_top':
                    this._marginTop = prop.value as number;
                    break;
                case 'margin_right':
                    this._marginRight = prop.value as number;
                    break;
                case 'margin_bottom':
                    this._marginBottom = prop.value as number;
                    break;
                case 'margins':
                {
                    // JSON layouts commonly declare a single nested `margins: {left,top,right,bottom}`
                    // var (serialized to XML as a Map) rather than 4 flat margin_* vars — without
                    // this case, that whole var was silently dropped and every label rendered with
                    // 0 margins, which shrink-wraps buttons/labels tight enough to clip descenders.
                    const margins = prop.value as {left?: number; top?: number; right?: number; bottom?: number} | null;

                    if(margins)
                    {
                        if(typeof margins.left === 'number') this._marginLeft = margins.left;
                        if(typeof margins.top === 'number') this._marginTop = margins.top;
                        if(typeof margins.right === 'number') this._marginRight = margins.right;
                        if(typeof margins.bottom === 'number') this._marginBottom = margins.bottom;
                    }

                    break;
                }
                case 'vertical':
                    this._vertical = !!prop.value;
                    break;
            }
        }

        super.properties = value;
        this.refresh();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextLabelController.as::get antiAliasType()
    public get antiAliasType(): string
    {
        return this._antiAliasType;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextLabelController.as::get gridFitType()
    public get gridFitType(): string
    {
        return this._gridFitType;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextLabelController.as::get sharpness()
    public get sharpness(): number
    {
        return this._sharpness;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextLabelController.as::get thickness()
    public get thickness(): number
    {
        return this._thickness;
    }

    private static getMeasureCtx(): OffscreenCanvasRenderingContext2D
    {
        if(!TextLabelController._measureCtx)
        {
            TextLabelController._measureCtx = new OffscreenCanvas(1, 1).getContext('2d')!;
        }

        return TextLabelController._measureCtx;
    }

    public override dispose(): void
    {
        if(this._disposed) return;

        super.dispose();
    }

    /**
	 * Refreshes text layout, recalculating dimensions and auto-sizing.
	 *
	 * Port of AS3 TextLabelController.refresh(). Gets a configured TextField
	 * via TextFieldCache, measures text, then auto-sizes the window to fit
	 * text content + margins.
	 *
	 * @see sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextLabelController.as refresh()
	 */
    // AS3: .../src/com/sulake/core/window/components/TextLabelController.as::refresh()
    private refresh(fromResize: boolean = false): void
    {
        if(this._refreshing) return;

        this._refreshing = true;

        if(!this._text)
        {
            this._textWidth = 0;
            this._textHeight = 0;
            this._refreshing = false;
            this._context.invalidate(this, null, 1);

            return;
        }

        // Measure text using shared canvas context
        const ctx = TextLabelController.getMeasureCtx();
        let fontStr = '';

        if(this._italic) fontStr += 'italic ';
        if(this._bold) fontStr += 'bold ';
        fontStr += `${this._fontSize}px ${quoteFontFamilyList(this._fontFace || 'Ubuntu, Arial, sans-serif')}`;
        ctx.font = fontStr;

        // Width has to come from whatever will actually draw the glyphs: the
        // atlas rounds advances under gridFitType="pixel", so measuring with
        // ctx.measureText() here would auto-size the label to a width the
        // renderer never uses.
        const atlas = GlyphAtlas.handles(this._antiAliasType)
            ? GlyphAtlas.get(fontStr, this._fontSize, this._antiAliasType, this._sharpness, this._thickness, this._gridFitType)
            : null;
        const measuredWidth = atlas
            ? Math.ceil(atlas.measure(this._text, this._spacing))
            : Math.ceil(ctx.measureText(this._text).width + (Math.max(0, this._text.length - 1) * this._spacing));
        const measuredHeight = measureFontLineHeight(ctx, this._fontSize, this._leading);

        this._textWidth = measuredWidth;
        this._textHeight = measuredHeight;

        // Auto-size: AS3 compares textField dimensions to available space and resizes
        const hMargins = this._marginLeft + this._marginRight;
        const vMargins = this._marginTop + this._marginBottom;
        const availWidth = this._width - hMargins;
        const availHeight = this._height - vMargins;

        let resized = false;

        if(!this._vertical)
        {
            if(measuredWidth !== availWidth)
            {
                this.setRectangle(this._x, this._y, measuredWidth + hMargins, Math.floor(measuredHeight) + vMargins);
                resized = true;
            }

            if(measuredHeight > availHeight && !resized)
            {
                this.setRectangle(this._x, this._y, measuredWidth + hMargins, Math.floor(measuredHeight) + vMargins);
                resized = true;
            }
        }
        else
        {
            if(measuredWidth !== availHeight)
            {
                this.setRectangle(this._x, this._y, Math.floor(measuredHeight) + hMargins, measuredWidth + vMargins);
                resized = true;
            }

            if(measuredHeight > availWidth && !resized)
            {
                this.setRectangle(this._x, this._y, Math.floor(measuredHeight) + hMargins, measuredWidth + vMargins);
                resized = true;
            }
        }

        this._refreshing = false;
        this._context.invalidate(this, null, 1);

        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextLabelController.as::refresh()
        // When the rectangle didn't actually change size, the normal WE_RESIZED dispatch from
        // setRectangle() never fires - so a synthetic one is sent here instead, unless this refresh
        // was itself triggered BY a resize (which will get its own WE_RESIZED through that path).
        if(!resized && !fromResize && this._eventDispatcher)
        {
            const event = WindowEvent.allocate(WindowEvent.WE_RESIZED, this, null);
            this._eventDispatcher.dispatchEvent(event);
            event.recycle();
        }
    }
}
