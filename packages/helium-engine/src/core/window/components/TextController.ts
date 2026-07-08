import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {ITextWindow} from './ITextWindow';
import type {IMargins} from '../utils/IMargins';
import {WindowController} from '../WindowController';
import {WindowEvent} from '../events/WindowEvent';
import {PropertyStruct} from '../utils/PropertyStruct';
import {TextStyleManager} from '../utils/TextStyleManager';
import {TextStyle} from '../utils/TextStyle';
import {TextMargins} from '../utils/TextMargins';
import {quoteFontFamilyList, measureFontLineHeight} from '../utils/CanvasFontString';

type MeasureContext = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

interface ITextLayout
{
    lines: string[];
    width: number;
    height: number;
}

/**
 * Port of AS3 TextController.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/TextController.as
 */
export class TextController extends WindowController implements ITextWindow
{
    private static readonly _propertySetters: Record<string, (ctrl: TextController, value: unknown) => void> = TextController.createPropertySetterTable();
    private static _measureCtx: MeasureContext | null = null;
    private static _measureCanvas: OffscreenCanvas | HTMLCanvasElement | null = null;

    protected _textStyleName: string = 'regular';
    protected _text: string = '';
    protected _htmlText: string = '';
    protected _localized: boolean = false;
    protected _displayRaw: boolean = false;
    protected _drawing: boolean = false;
    protected _settingRectangle: boolean = false;

    protected _marginLeft: number = 0;
    protected _marginTop: number = 0;
    protected _marginRight: number = 0;
    protected _marginBottom: number = 0;
    protected _margins: TextMargins = new TextMargins(0, 0, 0, 0, (margins: IMargins) => this.setTextMargins(margins));

    protected _scrollH: number = 0;
    protected _scrollV: number = 0;

    protected _autoSize: string = 'none';
    protected _overflowReplace: string = '';
    protected _maxChars: number = 0;
    protected _maxLines: number = 0;

    protected _textColor: number = 0;
    protected _bold: boolean = false;
    protected _italic: boolean = false;
    protected _underline: boolean = false;
    protected _fontFace: string = 'Ubuntu, Arial, sans-serif';
    protected _fontSize: number = 12;
    protected _spacing: number = 0;
    protected _leading: number = 0;
    protected _kerning: boolean = false;
    protected _restrict: string = '';

    protected _etchingColor: number = 0;
    protected _etchingPosition: string = 'bottom';

    protected _multiline: boolean = false;
    protected _wordWrap: boolean = false;
    protected _border: boolean = false;
    protected _borderColor: number = 0;
    protected _mouseWheelEnabled: boolean = false;
    protected _condenseWhite: boolean = false;
    protected _antiAliasType: string = 'advanced';
    protected _gridFitType: string = 'pixel';
    protected _alwaysShowSelection: boolean = false;
    protected _sharpness: number = 0;
    protected _thickness: number = 0;

    protected _fieldWidth: number = 0;
    protected _fieldHeight: number = 0;
    protected _textWidthCache: number = 0;
    protected _textHeightCache: number = 0;
    protected _numLinesCache: number = 1;
    protected _maxScrollHCache: number = 0;

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

        // These two only depend on the constructor's own `rect` argument (not
        // on anything another phase computes) and must already be correct
        // before applyProperties()'s refreshTextImage() call measures text -
        // so they stay here rather than moving to finalize().
        this._fieldWidth = rect.width;
        this._fieldHeight = rect.height;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/core/window/components/TextController.as::TextController() (setTextFormatting(), called post-super)
    protected override finalize(): void
    {
        super.finalize();

        this._hasVisualContent = true;
        this._textStyleName = this.resolveThemeTextStyle(this._context, this._style);
        this.applyTextStyle();
    }

    public get text(): string
    {
        return this._text;
    }

    public set text(value: string)
    {
        if(value == null) return;

        if(this._localized)
        {
            this.removeLocalizationListenerForCaption();
            this._localized = false;
        }

        this._caption = value;

        if(!this._displayRaw && this.isLocalizationKey(this._caption))
        {
            this._localized = true;
            this.registerLocalizationListenerForCaption();

            return;
        }

        this._text = this.replaceNonRenderableCharacters(this._caption);
        this._htmlText = this._text;
        this.refreshTextImage();
    }

    public override set caption(value: string)
    {
        this.text = value;
    }

    public get textColor(): number
    {
        return this._textColor;
    }

    public set textColor(value: number)
    {
        this._textColor = value;
        this.refreshTextImage();
    }

    public get bold(): boolean
    {
        return this._bold;
    }

    public set bold(value: boolean)
    {
        this._bold = value;
        this.refreshTextImage();
    }

    public get italic(): boolean
    {
        return this._italic;
    }

    public set italic(value: boolean)
    {
        this._italic = value;
        this.refreshTextImage();
    }

    public get underline(): boolean
    {
        return this._underline;
    }

    public set underline(value: boolean)
    {
        this._underline = value;
        this.refreshTextImage();
    }

    public get fontFace(): string
    {
        return this._fontFace;
    }

    public set fontFace(value: string)
    {
        this._fontFace = value;
        this.refreshTextImage();
    }

    public get fontSize(): number
    {
        return this._fontSize;
    }

    public set fontSize(value: number)
    {
        this._fontSize = value;
        this.refreshTextImage();
    }

    public get etchingColor(): number
    {
        return this._etchingColor;
    }

    public set etchingColor(value: number)
    {
        this._etchingColor = value;
        this.refreshTextImage();
    }

    public get etchingPosition(): string
    {
        return this._etchingPosition;
    }

    public set etchingPosition(value: string)
    {
        this._etchingPosition = value;
        this.refreshTextImage();
    }

    public get multiline(): boolean
    {
        return this._multiline;
    }

    public set multiline(value: boolean)
    {
        this._multiline = value;
        this.refreshTextImage();
    }

    public get wordWrap(): boolean
    {
        return this._wordWrap;
    }

    public set wordWrap(value: boolean)
    {
        this._wordWrap = value;
        this.refreshTextImage();
    }

    public get maxChars(): number
    {
        return this._maxChars;
    }

    public set maxChars(value: number)
    {
        this._maxChars = Math.max(0, value);
        this.refreshTextImage();
    }

    public get maxLines(): number
    {
        return this._maxLines;
    }

    public set maxLines(value: number)
    {
        this._maxLines = Math.max(0, value);
        this.refreshTextImage();
    }

    public get overflowReplace(): string
    {
        return this._overflowReplace;
    }

    public set overflowReplace(value: string)
    {
        this._overflowReplace = value ?? '';
        this.refreshTextImage();
    }

    public get isOverflowReplaceOn(): boolean
    {
        return this._overflowReplace !== '';
    }

    public get autoSize(): string
    {
        return this._autoSize;
    }

    public set autoSize(value: string)
    {
        if(value === this._autoSize) return;

        this._autoSize = value;
        this.refreshTextImage();
    }

    public get length(): number
    {
        return this._text.length;
    }

    public get numLines(): number
    {
        return this._numLinesCache;
    }

    public get textHeight(): number
    {
        return this._textHeightCache;
    }

    public get textWidth(): number
    {
        return this._textWidthCache;
    }

    public get textBackground(): boolean
    {
        return this.background;
    }

    public set textBackground(value: boolean)
    {
        this.background = value;
    }

    public get textBackgroundColor(): number
    {
        return this.color;
    }

    public set textBackgroundColor(value: number)
    {
        this.color = value;
    }

    public get scrollH(): number
    {
        return this._scrollH;
    }

    public set scrollH(value: number)
    {
        this._scrollH = value;
        this.refreshTextImage();
    }

    public get scrollV(): number
    {
        return this._scrollV;
    }

    public set scrollV(value: number)
    {
        if(value > this._scrollV || value < this._scrollV)
        {
            this._scrollV = value;
            this.refreshTextImage();
        }
    }

    public get maxScrollH(): number
    {
        return this._maxScrollHCache;
    }

    public get maxScrollV(): number
    {
        return Math.max(this._textHeightCache - this.height, 0);
    }

    public get scrollStepH(): number
    {
        return 10;
    }

    public set scrollStepH(_value: number)
    {
        // No-op AS3 behavior.
    }

    public get scrollStepV(): number
    {
        return this._numLinesCache > 0 ? this._textHeightCache / this._numLinesCache : 10;
    }

    public set scrollStepV(_value: number)
    {
        // No-op AS3 behavior.
    }

    public get visibleRegion(): { x: number; y: number; width: number; height: number }
    {
        return {
            x: this._scrollH * this.maxScrollH,
            y: this._scrollV * this.maxScrollV,
            width: this._width,
            height: this._height
        };
    }

    public get scrollableRegion(): { x: number; y: number; width: number; height: number }
    {
        return {
            x: 0,
            y: 0,
            width: this.maxScrollH + this._width,
            height: this.maxScrollV + this._height
        };
    }

    public get htmlText(): string
    {
        return this._htmlText;
    }

    public set htmlText(value: string)
    {
        if(value == null) return;

        if(this._localized)
        {
            this.removeLocalizationListenerForCaption();
            this._localized = false;
        }

        this._caption = value;

        if(!this._displayRaw && this.isLocalizationKey(this._caption))
        {
            this._localized = true;
            this.registerLocalizationListenerForCaption();

            return;
        }

        this._htmlText = this._caption;
        this._text = this._caption;
        this.refreshTextImage();
    }

    public get margins(): IMargins
    {
        return this._margins;
    }

    public get spacing(): number
    {
        return this._spacing;
    }

    public set spacing(value: number)
    {
        this._spacing = value;
        this.refreshTextImage();
    }

    public get leading(): number
    {
        return this._leading;
    }

    public set leading(value: number)
    {
        this._leading = value;
        this.refreshTextImage();
    }

    public set localization(value: string)
    {
        if(value == null) return;

        this._text = this.limitStringLength(value);
        this._htmlText = this._text;
        this.refreshTextImage();
    }

    public override setRectangle(x: number, y: number, width: number, height: number): void
    {
        if(this._settingRectangle || !this._multiline || !this._wordWrap)
        {
            super.setRectangle(x, y, width, height);

            return;
        }

        this._settingRectangle = true;

        const previousAutoSize = this._autoSize;

        this._autoSize = 'none';
        super.setRectangle(x, y, width, height);
        this._autoSize = previousAutoSize;

        this._settingRectangle = false;
    }

    public appendText(value: string): void
    {
        this._text += value;
        this._caption = this._text;
        this._htmlText = this._text;
        this.refreshTextImage();
    }

    public replaceText(beginIndex: number, endIndex: number, newText: string): void
    {
        this._text = this._text.substring(0, beginIndex) + newText + this._text.substring(endIndex);
        this._caption = this._text;
        this._htmlText = this._text;
        this.refreshTextImage();
    }

    public setTextMargins(value: IMargins): void
    {
        if(value !== this._margins)
        {
            this._margins.dispose();
            this._margins = new TextMargins(value.left, value.top, value.right, value.bottom, (margins: IMargins) => this.setTextMargins(margins));
        }

        this._marginLeft = this._margins.left;
        this._marginTop = this._margins.top;
        this._marginRight = this._margins.right;
        this._marginBottom = this._margins.bottom;

        if(this._autoSize === 'left')
        {
            this._fieldWidth = this._width - this._marginLeft - this._marginRight;
        }

        this.refreshTextImage();
    }

    public override get properties(): unknown[]
    {
        const props = super.properties;

        props.push(this.createProperty('always_show_selection', this._alwaysShowSelection));
        props.push(this.createProperty('antialias_type', this._antiAliasType));
        props.push(this.createProperty('auto_size', this._autoSize));
        props.push(this.createProperty('border', this._border));
        props.push(this.createProperty('border_color', this._borderColor));
        props.push(this.createProperty('etching_color', this._etchingColor));
        props.push(this.createProperty('etching_position', this._etchingPosition));
        props.push(this.createProperty('condense_white', this._condenseWhite));
        props.push(this.createProperty('font_face', this._fontFace));
        props.push(this.createProperty('font_size', this._fontSize));
        props.push(this.createProperty('grid_fit_type', this._gridFitType));
        props.push(this.createProperty('text_color', this._textColor));
        props.push(this.createProperty('text_style', this._textStyleName));
        props.push(this.createProperty('margin_left', this._marginLeft));
        props.push(this.createProperty('margin_top', this._marginTop));
        props.push(this.createProperty('margin_right', this._marginRight));
        props.push(this.createProperty('margin_bottom', this._marginBottom));
        props.push(this.createProperty('mouse_wheel_enabled', this._mouseWheelEnabled));
        props.push(this.createProperty('max_chars', this._maxChars));
        props.push(this.createProperty('multiline', this._multiline));
        props.push(this.createProperty('restrict', this._restrict));
        props.push(this.createProperty('sharpness', this._sharpness));
        props.push(this.createProperty('thickness', this._thickness));
        props.push(this.createProperty('word_wrap', this._wordWrap));
        props.push(this.createProperty('max_lines', this._maxLines));
        props.push(this.createProperty('overflow_replace', this._overflowReplace));
        props.push(this.createProperty('bold', this._bold));
        props.push(this.createProperty('italic', this._italic));
        props.push(this.createProperty('underline', this._underline));
        props.push(this.createProperty('kerning', this._kerning));
        props.push(this.createProperty('spacing', this._spacing));
        props.push(this.createProperty('leading', this._leading));

        return props;
    }

    public override set properties(value: unknown[])
    {
        this._drawing = true;

        for(const item of value)
        {
            const prop = item as PropertyStruct;
            const setter = TextController._propertySetters[prop.key];

            if(setter)
            {
                setter(this, prop.value);
            }
        }

        this._drawing = false;
        super.properties = value;
        this.refreshTextImage();
    }

    public override update(source: WindowController, event: WindowEvent): boolean
    {
        if(!this._drawing && event.type === WindowEvent.WE_RESIZED)
        {
            this.refreshTextImage(true);
        }

        return super.update(source, event);
    }

    public override clone(): IWindow
    {
        const cloned = super.clone() as TextController;

        cloned._textStyleName = this._textStyleName;
        cloned._text = this._text;
        cloned._htmlText = this._htmlText;
        cloned._localized = this._localized;
        cloned._displayRaw = this._displayRaw;
        cloned._drawing = false;
        cloned._settingRectangle = this._settingRectangle;
        cloned._marginLeft = this._marginLeft;
        cloned._marginTop = this._marginTop;
        cloned._marginRight = this._marginRight;
        cloned._marginBottom = this._marginBottom;
        cloned._margins = this._margins.clone((margins: IMargins) => cloned.setTextMargins(margins));
        cloned._scrollH = this._scrollH;
        cloned._scrollV = this._scrollV;
        cloned._autoSize = this._autoSize;
        cloned._overflowReplace = this._overflowReplace;
        cloned._maxChars = this._maxChars;
        cloned._maxLines = this._maxLines;
        cloned._textColor = this._textColor;
        cloned._bold = this._bold;
        cloned._italic = this._italic;
        cloned._underline = this._underline;
        cloned._fontFace = this._fontFace;
        cloned._fontSize = this._fontSize;
        cloned._spacing = this._spacing;
        cloned._leading = this._leading;
        cloned._kerning = this._kerning;
        cloned._restrict = this._restrict;
        cloned._etchingColor = this._etchingColor;
        cloned._etchingPosition = this._etchingPosition;
        cloned._multiline = this._multiline;
        cloned._wordWrap = this._wordWrap;
        cloned._border = this._border;
        cloned._borderColor = this._borderColor;
        cloned._mouseWheelEnabled = this._mouseWheelEnabled;
        cloned._condenseWhite = this._condenseWhite;
        cloned._antiAliasType = this._antiAliasType;
        cloned._gridFitType = this._gridFitType;
        cloned._alwaysShowSelection = this._alwaysShowSelection;
        cloned._sharpness = this._sharpness;
        cloned._thickness = this._thickness;
        cloned._fieldWidth = this._fieldWidth;
        cloned._fieldHeight = this._fieldHeight;
        cloned._textWidthCache = this._textWidthCache;
        cloned._textHeightCache = this._textHeightCache;
        cloned._numLinesCache = this._numLinesCache;
        cloned._maxScrollHCache = this._maxScrollHCache;

        return cloned;
    }

    public override dispose(): void
    {
        if(this._disposed) return;

        this.immediateClickMode = false;

        if(this._localized)
        {
            this.removeLocalizationListenerForCaption();
            this._localized = false;
        }

        if(this._margins)
        {
            this._margins.dispose();
        }

        super.dispose();
    }

    protected limitStringLength(value: string): string
    {
        return this._maxChars > 0 ? value.substring(0, this._maxChars) : value;
    }

    protected refreshTextImage(fromResize: boolean = false): void
    {
        if(this._drawing) return;

        this._drawing = true;

        const horizontalMargins = this._marginLeft + this._marginRight;
        const verticalMargins = this._marginTop + this._marginBottom;
        const availableWidth = this._width - horizontalMargins;
        const availableHeight = this._height - verticalMargins;
        const borderPadding = this._border ? 1 : 0;
        let hasResized = false;

        if(this._autoSize === 'none')
        {
            this._fieldWidth = Math.max(0, availableWidth - borderPadding);
            this._fieldHeight = Math.max(0, availableHeight - borderPadding);
        }

        let textValue = this._text;

        if(typeof textValue !== 'string')
        {
            textValue = String(textValue ?? '');
        }

        if(this._autoSize === 'none' && this.isOverflowReplaceOn)
        {
            textValue = this.applyOverflowReplace(textValue, Math.max(0, availableWidth), Math.max(0, availableHeight));
            this._text = textValue;
            this._htmlText = textValue;
        }

        const measured = this.measureLayout(textValue, Math.max(1, this._fieldWidth));

        if(this._autoSize !== 'none')
        {
            this._fieldWidth = Math.ceil(measured.width);
            this._fieldHeight = Math.ceil(measured.height);
        }

        const fieldWidthWithBorder = Math.floor(this._fieldWidth) + borderPadding;

        if(fieldWidthWithBorder !== availableWidth)
        {
            if(this._autoSize === 'left')
            {
                this.setRectangle(this.x, this.y, fieldWidthWithBorder + horizontalMargins, Math.floor(this._fieldHeight) + verticalMargins);
                hasResized = true;
            }
            else if(this._autoSize !== 'right' && this._autoSize !== 'center')
            {
                this._fieldWidth = Math.max(0, availableWidth - borderPadding);
                this._fieldHeight = Math.max(0, availableHeight - borderPadding);
            }
        }

        const fieldHeightWithBorder = Math.floor(this._fieldHeight) + borderPadding;

        if(fieldHeightWithBorder < availableHeight)
        {
            if(this._autoSize === 'none')
            {
                this._fieldHeight = Math.max(0, availableHeight - borderPadding);
            }
            else
            {
                this.height = Math.floor(this._fieldHeight) + verticalMargins;
                hasResized = true;
            }
        }
        else if(fieldHeightWithBorder > availableHeight)
        {
            if(this._autoSize !== 'none')
            {
                this.height = Math.floor(this._fieldHeight) + verticalMargins;
                hasResized = true;
            }
        }

        this._textWidthCache = measured.width;
        this._textHeightCache = measured.height;
        this._numLinesCache = measured.lines.length;
        this._maxScrollHCache = Math.max(0, Math.ceil(measured.width - Math.max(0, this._fieldWidth)));

        this._drawing = false;
        this._context.invalidate(this, null, 1);

        if(!hasResized && !fromResize && this._eventDispatcher)
        {
            const event = WindowEvent.allocate(WindowEvent.WE_RESIZED, this, null);
            this._eventDispatcher.dispatchEvent(event);
            event.recycle();
        }
    }

    protected applyTextStyle(): void
    {
        const style = TextStyleManager.getStyle(this._textStyleName) ?? TextStyleManager.getStyle('regular');

        if(!style) return;

        if(style.fontFamily != null) this._fontFace = style.fontFamily;
        if(style.fontSize != null) this._fontSize = style.fontSize;
        if(style.color != null) this._textColor = style.color;
        if(style.fontWeight != null) this._bold = style.fontWeight === 'bold';
        if(style.fontStyle != null) this._italic = style.fontStyle === 'italic';
        if(style.textDecoration != null) this._underline = style.textDecoration === 'underline';
        if(style.letterSpacing != null) this._spacing = style.letterSpacing;
        if(style.leading != null) this._leading = style.leading;
        if(style.kerning != null) this._kerning = style.kerning;
        if(style.etchingColor != null) this._etchingColor = style.etchingColor;
        if(style.etchingPosition != null) this._etchingPosition = style.etchingPosition;
        if(style.antiAliasType != null) this._antiAliasType = style.antiAliasType;
        if(style.sharpness != null) this._sharpness = style.sharpness;
        if(style.thickness != null) this._thickness = style.thickness;
    }

    protected resolveThemeTextStyle(context: IWindowContext, style: number): string
    {
        try
        {
            const defaults = context.getWindowFactory()?.getThemeManager()?.getPropertyDefaults(style);
            const raw = defaults?.getValue('text_style');

            if(raw instanceof PropertyStruct)
            {
                if(typeof raw.value === 'string' && raw.value.length > 0)
                {
                    return raw.value;
                }
            }
            else if(typeof raw === 'string' && raw.length > 0)
            {
                return raw;
            }
        }
        catch (_error)
        {
            // Ignore theme bootstrap errors.
        }

        return 'regular';
    }

    protected applyOverflowReplace(value: string, maxWidth: number, maxHeight: number): string
    {
        let output = value;

        if(typeof output !== 'string')
        {
            output = String(output ?? '');
        }

        if(!output || !this._overflowReplace)
        {
            return output;
        }

        const verticalMargins = this._marginTop + this._marginBottom;
        const horizontalMargins = this._marginLeft + this._marginRight;
        const wrapWidth = Math.max(1, this._fieldWidth);

        if(this.measureLayout(output, wrapWidth).height + verticalMargins > maxHeight)
        {
            let index = output.length;

            while(index > 0)
            {
                const candidate = output.slice(0, index - 1) + this._overflowReplace;

                if(this.measureLayout(candidate, wrapWidth).height + verticalMargins <= maxHeight)
                {
                    output = candidate;
                    break;
                }

                index--;
            }
        }

        if(this.measureLineWidth(output) + horizontalMargins > maxWidth)
        {
            let index = output.length;

            while(index > 0)
            {
                const candidate = output.slice(0, index - 1) + this._overflowReplace;

                if(this.measureLineWidth(candidate) + horizontalMargins <= maxWidth)
                {
                    output = candidate;
                    break;
                }

                index--;
            }
        }

        return output;
    }

    protected measureLayout(value: string, maxWidth: number): ITextLayout
    {
        let safeValue = value;

        if(typeof safeValue !== 'string')
        {
            safeValue = String(safeValue ?? '');
        }

        const text = this._condenseWhite ? safeValue.replace(/\s+/g, ' ') : safeValue;
        const lines = text.length > 0 ? this.buildMeasureLines(text, maxWidth) : [''];
        let width = 0;

        if(this._maxLines > 0 && lines.length > this._maxLines)
        {
            lines.length = this._maxLines;
        }

        for(const line of lines)
        {
            const current = this.measureLineWidth(line);

            if(current > width)
            {
                width = current;
            }
        }

        const lineHeight = this.getLineHeight();

        return {
            lines,
            width: Math.ceil(width),
            height: Math.ceil(Math.max(lineHeight, lines.length * lineHeight))
        };
    }

    protected buildMeasureLines(text: string, maxWidth: number): string[]
    {
        const out: string[] = [];
        const baseLines = text.split('\n');

        for(const baseLine of baseLines)
        {
            if(this._wordWrap && this._multiline && this._autoSize === 'none')
            {
                const wrapped = this.wrapLine(baseLine, maxWidth);

                for(const line of wrapped)
                {
                    out.push(line);
                }
            }
            else
            {
                out.push(baseLine);
            }
        }

        return out.length > 0 ? out : [''];
    }

    protected wrapLine(line: string, maxWidth: number): string[]
    {
        if(!line) return [''];

        const words = line.split(' ');
        const out: string[] = [];
        let current = '';

        for(const word of words)
        {
            const candidate = current ? `${current} ${word}` : word;

            if(this.measureLineWidth(candidate) <= maxWidth || !current)
            {
                current = candidate;
            }
            else
            {
                out.push(current);
                current = word;
            }

            if(this.measureLineWidth(current) > maxWidth)
            {
                const broken = this.wrapLongWord(current, maxWidth);

                if(broken.length > 0)
                {
                    out.push(...broken.slice(0, broken.length - 1));
                    current = broken[broken.length - 1];
                }
            }
        }

        if(current)
        {
            out.push(current);
        }

        return out;
    }

    protected wrapLongWord(word: string, maxWidth: number): string[]
    {
        const out: string[] = [];
        let current = '';

        for(let i = 0; i < word.length; i++)
        {
            const next = current + word.charAt(i);

            if(this.measureLineWidth(next) <= maxWidth || !current)
            {
                current = next;
            }
            else
            {
                out.push(current);
                current = word.charAt(i);
            }
        }

        if(current)
        {
            out.push(current);
        }

        return out;
    }

    protected measureLineWidth(text: string): number
    {
        if(typeof text !== 'string')
        {
            text = String(text ?? '');
        }

        if(!text) return 0;

        const ctx = TextController.getMeasureContext();

        ctx.font = this.buildCanvasFontString();

        const baseWidth = ctx.measureText(text).width;

        if(this._spacing === 0 || text.length <= 1)
        {
            return baseWidth;
        }

        return baseWidth + ((text.length - 1) * this._spacing);
    }

    protected buildCanvasFontString(): string
    {
        let font = '';

        if(this._italic) font += 'italic ';
        if(this._bold) font += 'bold ';
        font += `${this._fontSize}px ${quoteFontFamilyList(this._fontFace || 'Ubuntu, Arial, sans-serif')}`;

        return font;
    }

    protected getLineHeight(): number
    {
        const ctx = TextController.getMeasureContext();

        ctx.font = this.buildCanvasFontString();

        return Math.max(1, measureFontLineHeight(ctx, this._fontSize, this._leading));
    }

    protected replaceNonRenderableCharacters(value: string): string
    {
        // AS3 checks glyph support on embedded fonts; browser canvas does not expose equivalent APIs.
        return value;
    }

    protected isLocalizationKey(value: string): boolean
    {
        return value.length > 3 && value.charAt(0) === '$' && value.charAt(1) === '{' && value.indexOf('}') > 1;
    }

    protected getLocalizationKeyFromCaption(): string | null
    {
        if(!this.isLocalizationKey(this._caption)) return null;

        const end = this._caption.indexOf('}');

        if(end <= 2) return null;

        return this._caption.slice(2, end);
    }

    protected registerLocalizationListenerForCaption(): void
    {
        const key = this.getLocalizationKeyFromCaption();

        if(!key) return;

        this.context.registerLocalizationListener(key, this);
    }

    protected removeLocalizationListenerForCaption(): void
    {
        const key = this.getLocalizationKeyFromCaption();

        if(!key) return;

        this.context.removeLocalizationListener(key, this);
    }

    protected static getMeasureContext(): MeasureContext
    {
        if(TextController._measureCtx)
        {
            return TextController._measureCtx;
        }

        if(typeof OffscreenCanvas !== 'undefined')
        {
            TextController._measureCanvas = new OffscreenCanvas(1, 1);
            TextController._measureCtx = TextController._measureCanvas.getContext('2d');
        }
        else if(typeof document !== 'undefined')
        {
            TextController._measureCanvas = document.createElement('canvas');
            TextController._measureCanvas.width = 1;
            TextController._measureCanvas.height = 1;
            TextController._measureCtx = TextController._measureCanvas.getContext('2d');
        }

        if(!TextController._measureCtx)
        {
            throw new Error('Text measurement context is unavailable.');
        }

        return TextController._measureCtx;
    }

    protected static createPropertySetterTable(): Record<string, (ctrl: TextController, value: unknown) => void>
    {
        return {
            'always_show_selection': (ctrl, v) =>
            {
                ctrl._alwaysShowSelection = !!v;
            },
            'antialias_type': (ctrl, v) =>
            {
                ctrl._antiAliasType = String(v) === 'normal' ? 'normal' : 'advanced';
                ctrl.refreshTextImage();
            },
            'auto_size': (ctrl, v) =>
            {
                ctrl._autoSize = String(v ?? 'none');
                ctrl.refreshTextImage();
            },
            'background': (ctrl, v) =>
            {
                ctrl.background = !!v;
            },
            'background_color': (ctrl, v) =>
            {
                ctrl.color = Number(v);
            },
            'bold': (ctrl, v) =>
            {
                ctrl._bold = !!v;
            },
            'border': (ctrl, v) =>
            {
                ctrl._border = !!v;
                ctrl.refreshTextImage();
            },
            'border_color': (ctrl, v) =>
            {
                ctrl._borderColor = Number(v);
                ctrl.refreshTextImage();
            },
            'condense_white': (ctrl, v) =>
            {
                ctrl._condenseWhite = !!v;
                ctrl.refreshTextImage();
            },
            'etching_color': (ctrl, v) =>
            {
                ctrl._etchingColor = Number(v);
                ctrl.refreshTextImage();
            },
            'etching_position': (ctrl, v) =>
            {
                ctrl._etchingPosition = String(v);
                ctrl.refreshTextImage();
            },
            'font_face': (ctrl, v) =>
            {
                ctrl._fontFace = String(v);
                ctrl.refreshTextImage();
            },
            'font_size': (ctrl, v) =>
            {
                ctrl._fontSize = Number(v);
                ctrl.refreshTextImage();
            },
            'grid_fit_type': (ctrl, v) =>
            {
                ctrl._gridFitType = String(v);
                ctrl.refreshTextImage();
            },
            'italic': (ctrl, v) =>
            {
                ctrl._italic = !!v;
            },
            'kerning': (ctrl, v) =>
            {
                ctrl._kerning = !!v;
            },
            'leading': (ctrl, v) =>
            {
                ctrl._leading = Number(v);
                ctrl.refreshTextImage();
            },
            'margin_left': (ctrl, v) =>
            {
                ctrl._marginLeft = Number(v);
                ctrl.refreshTextImage();
            },
            'margin_top': (ctrl, v) =>
            {
                ctrl._marginTop = Number(v);
                ctrl.refreshTextImage();
            },
            'margin_right': (ctrl, v) =>
            {
                ctrl._marginRight = Number(v);
                ctrl.refreshTextImage();
            },
            'margin_bottom': (ctrl, v) =>
            {
                ctrl._marginBottom = Number(v);
                ctrl.refreshTextImage();
            },
            // JSON layouts commonly declare a single nested `margins: {left,top,right,bottom}`
            // var (serialized to XML as a Map) rather than 4 flat margin_* vars — without this
            // entry, that whole var was silently dropped and text rendered with 0 margins.
            'margins': (ctrl, v) =>
            {
                const margins = v as {left?: number; top?: number; right?: number; bottom?: number} | null;

                if(margins)
                {
                    if(typeof margins.left === 'number') ctrl._marginLeft = margins.left;
                    if(typeof margins.top === 'number') ctrl._marginTop = margins.top;
                    if(typeof margins.right === 'number') ctrl._marginRight = margins.right;
                    if(typeof margins.bottom === 'number') ctrl._marginBottom = margins.bottom;
                }

                ctrl.refreshTextImage();
            },
            'max_chars': (ctrl, v) =>
            {
                ctrl._maxChars = Math.max(0, Number(v));
                ctrl.refreshTextImage();
            },
            'max_lines': (ctrl, v) =>
            {
                ctrl._maxLines = Math.max(0, Number(v));
                ctrl.refreshTextImage();
            },
            'mouse_wheel_enabled': (ctrl, v) =>
            {
                ctrl._mouseWheelEnabled = !!v;
            },
            'multiline': (ctrl, v) =>
            {
                ctrl._multiline = !!v;
                ctrl.refreshTextImage();
            },
            'overflow_replace': (ctrl, v) =>
            {
                ctrl._overflowReplace = String(v ?? '');
                ctrl.refreshTextImage();
            },
            'restrict': (ctrl, v) =>
            {
                ctrl._restrict = String(v ?? '');
            },
            'sharpness': (ctrl, v) =>
            {
                ctrl._sharpness = Number(v);
                ctrl.refreshTextImage();
            },
            'spacing': (ctrl, v) =>
            {
                ctrl._spacing = Number(v);
                ctrl.refreshTextImage();
            },
            'text_color': (ctrl, v) =>
            {
                ctrl._textColor = Number(v);
                ctrl.refreshTextImage();
            },
            'text_style': (ctrl, v) =>
            {
                ctrl._textStyleName = String(v);
                ctrl.applyTextStyle();
                ctrl.refreshTextImage();
            },
            'thickness': (ctrl, v) =>
            {
                ctrl._thickness = Number(v);
                ctrl.refreshTextImage();
            },
            'underline': (ctrl, v) =>
            {
                ctrl._underline = !!v;
            },
            'word_wrap': (ctrl, v) =>
            {
                ctrl._wordWrap = !!v;
                ctrl.refreshTextImage();
            },
        };
    }

    public resetExplicitStyle(): void
    {
        // Kept for AS3 API parity.
    }
}
