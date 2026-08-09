import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {ITextWindow, ITextFormat} from './ITextWindow';
import type {IMargins} from '../utils/IMargins';
import {WindowController} from '../WindowController';
import {WindowEvent} from '../events/WindowEvent';
import {PropertyStruct} from '../utils/PropertyStruct';
import {TextStyleManager} from '../utils/TextStyleManager';
import {TextMargins} from '../utils/TextMargins';
import {quoteFontFamilyList, measureFontLineHeight} from '../utils/CanvasFontString';
import {GlyphAtlas} from '../utils/GlyphAtlas';

type MeasureContext = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

interface ITextLayout
{
    lines: string[];
    width: number;
    height: number;
}

// TS-only: internal storage type for TextController._formatRuns (see setTextFormat()).
export interface ITextFormatRange
{
    // TS-only: start index of the range (inclusive), in `text` coordinates.
    start: number;
    // TS-only: end index of the range (exclusive), in `text` coordinates.
    end: number;
    // TS-only: the format override applied to [start, end).
    format: ITextFormat;
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

    // AS3: .../src/com/sulake/core/window/components/TextController.as::_textStyleName
    protected _textStyleName: string = 'regular';
    protected _text: string = '';
    protected _htmlText: string = '';
    // AS3: .../src/com/sulake/core/window/components/TextController.as::_localized
    protected _localized: boolean = false;
    protected _displayRaw: boolean = false;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::_drawing
    protected _drawing: boolean = false;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::_settingRectangle
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
    // AS3: .../src/com/sulake/core/window/components/TextController.as::_maxLines
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

    // TS-only: parsed form of `_restrict`, rebuilt whenever the raw mask changes. Flash parsed
    // the mask inside the player; here it has to be done by hand, so the result is cached rather
    // than recomputed per keystroke.
    private _restrictSource: string | null = null;
    private _restrictAllow: Array<[number, number]> = [];
    private _restrictDeny: Array<[number, number]> = [];

    // AS3: .../src/com/sulake/core/window/components/TextController.as::_etchingColor
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::_field
    // Flash's own top-padding quirk for TextField content — must match
    // WindowComposite.FLASH_TEXT_FIELD_TOP_GUTTER, which renders the same text.
    // Protected, not private: TextFieldController positions its DOM caret bridge
    // against the very same gutter (see positionInputElement()).
    protected static readonly FLASH_TEXT_FIELD_TOP_GUTTER: number = 2;

    // The horizontal half of the same Flash gutter. TextSkinRenderer applies it to
    // editable fields (its FLASH_TEXT_FIELD_LEFT_GUTTER, and the TODO(AS3) there
    // explains why only those), so the caret bridge has to start from the same
    // origin or the caret sits 2px left of the glyphs.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::_field
    protected static readonly FLASH_TEXT_FIELD_LEFT_GUTTER: number = 2;

    // TS-only: per-range TextFormat overrides applied via setTextFormat().
    // Cleared whenever `text`/`htmlText` is reassigned, matching Flash's
    // TextField resetting all character formatting on content replacement.
    protected _formatRuns: ITextFormatRange[] = [];

    // TS-only: exposes _formatRuns to WindowComposite's duck-typed read
    // (see WindowComposite.compositeText()'s per-range rendering branch).
    public get formatRuns(): ReadonlyArray<ITextFormatRange>
    {
        return this._formatRuns;
    }

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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::TextController() (setTextFormatting(), called post-super)
    protected override finalize(): void
    {
        super.finalize();

        this._hasVisualContent = true;
        this._textStyleName = this.resolveThemeTextStyle(this._context, this._style);
        this.applyTextStyle();
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get text()
    public get text(): string
    {
        return this._text;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set text()
    public set text(value: string)
    {
        if(value == null) return;

        this._formatRuns = [];

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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/WindowController.as::get caption()
    // Declaring `set caption` below WITHOUT a matching getter creates an accessor
    // whose [[Get]] is undefined, which shadows WindowController's inherited
    // `get caption` - so `textField.caption` returned undefined even though `_caption`
    // was correctly kept in sync (via set text). That silently broke every caller
    // reading a text field's caption: e.g. SpinnerCatalogWidget.onInputEvent read
    // `event.target.caption` (undefined) and reset the catalog quantity to 1 on every
    // keystroke. Re-expose the base getter so caption reflects the live content again.
    public override get caption(): string
    {
        return super.caption;
    }

    public override set caption(value: string)
    {
        this.text = value;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get textColor()
    public get textColor(): number
    {
        return this._textColor;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set textColor()
    public set textColor(value: number)
    {
        this._textColor = value;
        this.refreshTextImage();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::set background()
    // AS3's TextController mirrors `background` onto a real flash.text.TextField
    // (`_field.background = param1`), and Flash always paints a TextField's background
    // OPAQUE using its `backgroundColor` (default 0xFFFFFF white). This port has no
    // `_field`; the background is filled by WindowComposite, which derives the fill
    // alpha from the colour's high byte. That byte defaults to 0 (see WindowModel
    // `_alphaColor = 0`), so a background-enabled text field with no explicit
    // `background_color` filled fully transparent and drew nothing - which is why the
    // inventory stack-count number disappeared, leaving only the teal `number_container`
    // badge (the "blue square"). Force the high byte opaque when a background is enabled
    // and no alpha was set, so the default white backing is painted like Flash. Fills
    // that already carry an alpha are left untouched (WindowComposite already draws
    // those), so this can only add a previously-invisible backing, never alter a visible one.
    public override get color(): number
    {
        const value = super.color;

        if(this.background && (value & 0xFF000000) === 0)
        {
            return value | 0xFF000000;
        }

        return value;
    }

    // Re-expose the base setter: declaring the getter above would otherwise shadow
    // WindowController's `set color`, silently dropping assignments (e.g. the
    // `background_color` property handler). Delegates unchanged to the base.
    public override set color(value: number)
    {
        super.color = value;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get bold()
    public get bold(): boolean
    {
        return this._bold;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set bold()
    public set bold(value: boolean)
    {
        this._bold = value;
        this.refreshTextImage();
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get italic()
    public get italic(): boolean
    {
        return this._italic;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set italic()
    public set italic(value: boolean)
    {
        this._italic = value;
        this.refreshTextImage();
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get underline()
    public get underline(): boolean
    {
        return this._underline;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set underline()
    public set underline(value: boolean)
    {
        this._underline = value;
        this.refreshTextImage();
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get fontFace()
    public get fontFace(): string
    {
        return this._fontFace;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set fontFace()
    public set fontFace(value: string)
    {
        this._fontFace = value;
        this.refreshTextImage();
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get fontSize()
    public get fontSize(): number
    {
        return this._fontSize;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set fontSize()
    public set fontSize(value: number)
    {
        this._fontSize = value;
        this.refreshTextImage();
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get etchingColor()
    public get etchingColor(): number
    {
        return this._etchingColor;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set etchingColor()
    public set etchingColor(value: number)
    {
        this._etchingColor = value;
        this.refreshTextImage();
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get etchingPosition()
    public get etchingPosition(): string
    {
        return this._etchingPosition;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set etchingPosition()
    public set etchingPosition(value: string)
    {
        this._etchingPosition = value;
        this.refreshTextImage();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::get antiAliasType()
    public get antiAliasType(): string
    {
        return this._antiAliasType;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::set antiAliasType()
    // AS3 normalises anything that is not "normal" to "advanced"
    // (TextController.as::setAntiAliasType()).
    public set antiAliasType(value: string)
    {
        this._antiAliasType = value === 'normal' ? 'normal' : 'advanced';
        this.refreshTextImage();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::get gridFitType()
    public get gridFitType(): string
    {
        return this._gridFitType;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::set gridFitType()
    public set gridFitType(value: string)
    {
        this._gridFitType = value;
        this.refreshTextImage();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::get sharpness()
    public get sharpness(): number
    {
        return this._sharpness;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::set sharpness()
    public set sharpness(value: number)
    {
        this._sharpness = value;
        this.refreshTextImage();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::get thickness()
    public get thickness(): number
    {
        return this._thickness;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::set thickness()
    public set thickness(value: number)
    {
        this._thickness = value;
        this.refreshTextImage();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::get border()
    public get border(): boolean
    {
        return this._border;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::setBorder()
    public set border(value: boolean)
    {
        this._border = value;
        this.refreshTextImage();
    }

    /**
	 * Flash's `TextField.borderColor` is a plain RGB uint with no alpha channel —
	 * the border it draws is always opaque. WindowComposite relies on that when it
	 * paints the border, and on the default staying black (Flash's own).
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::get borderColor()
    public get borderColor(): number
    {
        return this._borderColor;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::setBorderColor()
    public set borderColor(value: number)
    {
        this._borderColor = value;
        this.refreshTextImage();
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get multiline()
    public get multiline(): boolean
    {
        return this._multiline;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set multiline()
    public set multiline(value: boolean)
    {
        this._multiline = value;
        this.refreshTextImage();
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get wordWrap()
    public get wordWrap(): boolean
    {
        return this._wordWrap;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set wordWrap()
    public set wordWrap(value: boolean)
    {
        this._wordWrap = value;
        this.refreshTextImage();
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get maxChars()
    public get maxChars(): number
    {
        return this._maxChars;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set maxChars()
    public set maxChars(value: number)
    {
        this._maxChars = Math.max(0, value);
        this.refreshTextImage();
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get maxLines()
    public get maxLines(): number
    {
        return this._maxLines;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set maxLines()
    public set maxLines(value: number)
    {
        this._maxLines = Math.max(0, value);
        this.refreshTextImage();
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get overflowReplace()
    public get overflowReplace(): string
    {
        return this._overflowReplace;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set overflowReplace()
    public set overflowReplace(value: string)
    {
        this._overflowReplace = value ?? '';
        this.refreshTextImage();
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get isOverflowReplaceOn()
    public get isOverflowReplaceOn(): boolean
    {
        return this._overflowReplace !== '';
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get autoSize()
    public get autoSize(): string
    {
        return this._autoSize;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set autoSize()
    public set autoSize(value: string)
    {
        if(value === this._autoSize) return;

        this._autoSize = value;
        this.refreshTextImage();
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get length()
    public get length(): number
    {
        return this._text.length;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get numLines()
    public get numLines(): number
    {
        return this._numLinesCache;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get textHeight()
    public get textHeight(): number
    {
        return this._textHeightCache;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get textWidth()
    public get textWidth(): number
    {
        return this._textWidthCache;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get textBackground()
    public get textBackground(): boolean
    {
        return this.background;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set textBackground()
    public set textBackground(value: boolean)
    {
        this.background = value;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get textBackgroundColor()
    public get textBackgroundColor(): number
    {
        return this.color;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set textBackgroundColor()
    public set textBackgroundColor(value: number)
    {
        this.color = value;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get scrollH()
    public get scrollH(): number
    {
        return this._scrollH;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set scrollH()
    public set scrollH(value: number)
    {
        this._scrollH = value;
        this.refreshTextImage();
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get scrollV()
    public get scrollV(): number
    {
        return this._scrollV;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set scrollV()
    public set scrollV(value: number)
    {
        if(value > this._scrollV || value < this._scrollV)
        {
            this._scrollV = value;
            this.refreshTextImage();
        }
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get maxScrollH()
    public get maxScrollH(): number
    {
        return this._maxScrollHCache;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get maxScrollV()
    public get maxScrollV(): number
    {
        return Math.max(this._textHeightCache - this.height, 0);
    }

    // AS3: sources/win63_version/core/window/components/TextController.as::get scrollStepH()
    public get scrollStepH(): number
    {
        return 10;
    }

    // AS3: sources/win63_version/core/window/components/TextController.as::set scrollStepH()
    public set scrollStepH(_value: number)
    {
        // No-op AS3 behavior.
    }

    // AS3: sources/win63_version/core/window/components/TextController.as::get scrollStepV()
    public get scrollStepV(): number
    {
        return this._numLinesCache > 0 ? this._textHeightCache / this._numLinesCache : 10;
    }

    // AS3: sources/win63_version/core/window/components/TextController.as::set scrollStepV()
    public set scrollStepV(_value: number)
    {
        // No-op AS3 behavior.
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get visibleRegion()
    public get visibleRegion(): { x: number; y: number; width: number; height: number }
    {
        return {
            x: this._scrollH * this.maxScrollH,
            y: this._scrollV * this.maxScrollV,
            width: this._width,
            height: this._height
        };
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get scrollableRegion()
    public get scrollableRegion(): { x: number; y: number; width: number; height: number }
    {
        return {
            x: 0,
            y: 0,
            width: this.maxScrollH + this._width,
            height: this.maxScrollV + this._height
        };
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get htmlText()
    public get htmlText(): string
    {
        return this._htmlText;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set htmlText()
    public set htmlText(value: string)
    {
        if(value == null) return;

        this._formatRuns = [];

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

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get margins()
    public get margins(): IMargins
    {
        return this._margins;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get spacing()
    public get spacing(): number
    {
        return this._spacing;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set spacing()
    public set spacing(value: number)
    {
        this._spacing = value;
        this.refreshTextImage();
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get leading()
    public get leading(): number
    {
        return this._leading;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set leading()
    public set leading(value: number)
    {
        this._leading = value;
        this.refreshTextImage();
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::set localization()
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

    // AS3: .../src/com/sulake/core/window/components/TextController.as::appendText()
    public appendText(value: string): void
    {
        this._text += value;
        this._caption = this._text;
        this._htmlText = this._text;
        this.refreshTextImage();
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::replaceText()
    public replaceText(beginIndex: number, endIndex: number, newText: string): void
    {
        this._text = this._text.substring(0, beginIndex) + newText + this._text.substring(endIndex);
        this._caption = this._text;
        this._htmlText = this._text;
        this.refreshTextImage();
    }

    /**
	 * Maps a point local to this window (0,0 = top-left) to a character
	 * index in `text`, or -1 if the point isn't over any character.
	 *
	 * TODO(AS3): word-wrapped continuation lines aren't reverse-mapped here —
	 * only explicit '\n' breaks are accounted for. The only current caller
	 * (chat-bubble message links, see RoomChatItem.testMessageLinkMouseClick())
	 * always renders single-line, unwrapped text, so this doesn't affect real
	 * behavior yet.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::getCharIndexAtPoint()
    public getCharIndexAtPoint(localX: number, localY: number): number
    {
        if(!this._text) return -1;

        const lineHeight = this.getLineHeight();
        const paragraphs = this._text.split('\n');
        const lineIndex = Math.floor((localY - this._marginTop - TextController.FLASH_TEXT_FIELD_TOP_GUTTER) / lineHeight);

        if(lineIndex < 0 || lineIndex >= paragraphs.length) return -1;

        let charOffset = 0;

        for(let i = 0; i < lineIndex; i++)
        {
            charOffset += paragraphs[i].length + 1;
        }

        const line = paragraphs[lineIndex];
        const ctx = TextController.getMeasureContext();

        ctx.font = this.buildCanvasFontString();

        let x = this._marginLeft;

        for(let i = 0; i < line.length; i++)
        {
            const charWidth = ctx.measureText(line.charAt(i)).width + this._spacing;

            if(localX >= x && localX < x + charWidth)
            {
                return charOffset + i;
            }

            x += charWidth;
        }

        return -1;
    }

    /**
	 * Returns the base text format (color/underline/bold/italic/font/size).
	 * AS3's native TextField.getTextFormat(begin, end) can return the format
	 * of a sub-range when both indexes are given, but every real caller here
	 * (RoomChatItem, to seed a format it then narrows via setTextFormat())
	 * calls it with no arguments for the whole-field base format, so a
	 * per-range read isn't implemented.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::getTextFormat()
    public getTextFormat(_beginIndex: number = -1, _endIndex: number = -1): ITextFormat
    {
        return {
            font: this._fontFace,
            size: this._fontSize,
            color: this._textColor,
            bold: this._bold,
            italic: this._italic,
            underline: this._underline,
        };
    }

    /**
	 * Applies a format override to a character range. Faithful to AS3: only
	 * takes effect when a valid range is given (0 <= beginIndex < endIndex <
	 * text.length) — calling this with no range is a silent no-op in the
	 * original too (TextController.as::setTextFormat() guards on exactly
	 * this condition before touching `_field`).
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::setTextFormat()
    public setTextFormat(format: ITextFormat, beginIndex: number = -1, endIndex: number = -1): void
    {
        if(beginIndex >= 0 && endIndex > beginIndex && endIndex < this._text.length)
        {
            this._formatRuns.push({start: beginIndex, end: endIndex, format});
            this.refreshTextImage();
        }
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::setTextMargins()
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
        cloned._formatRuns = [...this._formatRuns];

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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::get restrict()
    get restrict(): string
    {
        return this._restrict;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::set restrict()
    set restrict(value: string)
    {
        this._restrict = value;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::limitStringLength()
    protected limitStringLength(value: string): string
    {
        return this._maxChars > 0 ? value.substring(0, this._maxChars) : value;
    }

    /**
	 * Drops every character the `restrict` mask disallows.
	 *
	 * AS3 assigns the mask straight to `flash.text.TextField.restrict` and the player does the
	 * filtering, so there is no algorithm in the source to copy — what is ported here is the
	 * documented semantics of that property:
	 *
	 * - characters listed before any `^` are the only ones accepted;
	 * - characters after a `^` are removed from whatever is accepted so far, and a mask that
	 *   *starts* with `^` therefore means "everything except";
	 * - `a-z` is an inclusive range, and a `-` that cannot form one is a literal;
	 * - `\` escapes the next character, so `\-`, `\^` and `\\` are literals;
	 * - the mask applies to typing only, never to text assigned in code.
	 *
	 * One deliberate difference: Flash distinguishes `restrict = null` (no restriction) from
	 * `restrict = ""` (reject everything). This port has always typed the field as a plain
	 * `string` defaulting to `''`, and every layout leaves it unset, so `''` has to keep meaning
	 * "no restriction" — treating it as Flash's empty mask would silently make every text field
	 * in the client read-only.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::setRestrict()
    protected applyRestrict(value: string): string
    {
        if(this._restrict === '') return value;

        this.parseRestrict();

        let result = '';

        for(const char of value)
        {
            if(this.isCharRestrictAllowed(char.charCodeAt(0))) result += char;
        }

        return result;
    }

    // TS-only: builds the cached range lists behind applyRestrict().
    private parseRestrict(): void
    {
        if(this._restrictSource === this._restrict) return;

        this._restrictSource = this._restrict;
        this._restrictAllow = [];
        this._restrictDeny = [];

        const mask = this._restrict;

        // `^` flips which list subsequent characters land in, and can appear more than once.
        let target = this._restrictAllow;
        let index = 0;

        const readChar = (): number | null =>
        {
            if(index >= mask.length) return null;

            const char = mask[index];

            if(char === '\\')
            {
                index++;

                return index < mask.length ? mask.charCodeAt(index++) : null;
            }

            index++;

            return char.charCodeAt(0);
        };

        while(index < mask.length)
        {
            if(mask[index] === '^')
            {
                target = target === this._restrictAllow ? this._restrictDeny : this._restrictAllow;
                index++;
                continue;
            }

            const start = readChar();

            if(start === null) break;

            // A `-` only opens a range when there is something on both sides of it; trailing or
            // escaped ones are literals.
            if(mask[index] === '-' && index + 1 < mask.length && mask[index + 1] !== '^')
            {
                index++;

                const end = readChar();

                if(end === null)
                {
                    target.push([start, start]);
                    target.push([0x2D, 0x2D]);
                    break;
                }

                target.push([start, end]);
            }
            else
            {
                target.push([start, start]);
            }
        }
    }

    // TS-only: range lookup for applyRestrict().
    private isCharRestrictAllowed(code: number): boolean
    {
        const inRanges = (ranges: Array<[number, number]>): boolean =>
            ranges.some(([start, end]) => code >= start && code <= end);

        // No allow list at all means the mask was purely subtractive ("^abc"): everything passes
        // except what the deny list names.
        const allowed = this._restrictAllow.length === 0 || inRanges(this._restrictAllow);

        return allowed && !inRanges(this._restrictDeny);
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::refreshTextImage()
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

            // AS3/Flash: a flash.text.TextField reserves a 2px gutter ABOVE and BELOW the
            // text, so its height - and thus the rect its `background` fills - is
            // textHeight + 4, not the bare line height measured here. The renderer already
            // offsets glyphs down by the top gutter (TextSkinRenderer.FLASH_TEXT_FIELD_TOP_GUTTER)
            // but the box height omitted both gutters, leaving the background fill ~4px short.
            // For a background-filled auto-sized field this exposed a strip of the parent below
            // the text - e.g. the inventory count badge showed the teal `number_container` under
            // the white `number` field (11px text box in a 15px container = 4px of teal). Only
            // widen background fields, where the gutter is visible, so the many auto-sized labels
            // with no background keep their exact box height and do not shift.
            if(this._background)
            {
                this._fieldHeight += 2 * TextController.FLASH_TEXT_FIELD_TOP_GUTTER;
            }
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

    /**
	 * The atlas this field's text is drawn through, or null when the atlas is
	 * disabled.
	 *
	 * Measurement has to come from the same place as drawing: with
	 * `gridFitType = "pixel"` the atlas rounds advances to whole pixels, so a
	 * field measured with `ctx.measureText()` and drawn with the atlas would
	 * auto-size to the wrong width.
	 */
    // TS-only: no AS3 counterpart — Flash's TextField both measures and draws.
    protected getAtlas(): GlyphAtlas | null
    {
        if(!GlyphAtlas.handles(this._antiAliasType)) return null;

        return GlyphAtlas.get(
            this.buildCanvasFontString(),
            this._fontSize,
            this._antiAliasType,
            this._sharpness,
            this._thickness,
            this._gridFitType
        );
    }

    protected measureLineWidth(text: string): number
    {
        if(typeof text !== 'string')
        {
            text = String(text ?? '');
        }

        if(!text) return 0;

        const atlas = this.getAtlas();

        if(atlas) return atlas.measure(text, this._spacing);

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

    // AS3: .../src/com/sulake/core/window/components/TextController.as::replaceNonRenderableCharacters()
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

    // Keys are wire-format property names (snake_case, e.g. from JSON layout
    // data) dispatching to setter logic - they must stay snake_case to match
    // what's actually parsed, not camelCase.
    /* eslint-disable @typescript-eslint/naming-convention */
    // AS3: .../src/com/sulake/core/window/components/TextController.as::createPropertySetterTable()
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
            // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::setDefaultTextFormat()
            // TODO(AS3): AS3 assigns a whole flash.text.TextFormat object (`_field.defaultTextFormat
            // = value`) in one shot. This port has no TextFormat-equivalent bulk type - formatting
            // is split into the granular properties already handled elsewhere in this table
            // (bold/font_face/font_size/italic/etc.), so there is nothing to assign wholesale here.
            // No shipped layout emits this key, so it is currently unreachable either way.
            'default_text_format': (ctrl) =>
            {
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
    /* eslint-enable @typescript-eslint/naming-convention */

    // AS3: .../src/com/sulake/core/window/components/TextController.as::resetExplicitStyle()
    public resetExplicitStyle(): void
    {
        // Kept for AS3 API parity.
    }
}
