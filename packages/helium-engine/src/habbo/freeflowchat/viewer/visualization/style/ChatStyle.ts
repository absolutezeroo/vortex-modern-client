import type {Container, Point, Rectangle} from 'pixi.js';
import type {IChatTextFormat, IChatStyle} from '@habbo/freeflowchat/style/IChatStyle';
import {HabboFreeFlowChat} from '@habbo/freeflowchat/HabboFreeFlowChat';
import type {IChatLinkStyleSheet, IChatStyleInternal} from './IChatStyleInternal';

/**
 * IChatStyleDescriptor
 *
 * All data ChatStyleLibrary reads out of a style's `regpoints` config text and
 * `style_<assetId>_*` assets, gathered up-front so ChatStyle's constructor can
 * take a single object instead of AS3's 27 positional constructor params
 * (same descriptor-object approach already used by
 * `@habbo/ui/widget/roomchat/style/ChatBubbleStyle`'s `IChatBubbleStyleDescriptor`).
 */
export interface IChatStyleDescriptor
{
    background: ImageBitmap;
    scale9Grid: Rectangle;
    pointer: ImageBitmap | null;
    pointerY: number;
    pointerXMargins: number[] | null;
    textFieldMargins: Rectangle;
    textFormat: IChatTextFormat;
    isAnonymous: boolean;
    emblem: ImageBitmap | null;
    emblemOffset: Point | null;
    emblemMultiline: ImageBitmap | null;
    emblemMultilineOffset: Point | null;
    faceOffset: Point | null;
    icon: ImageBitmap | null;
    selectorPreview: ImageBitmap;
    isSystemStyle: boolean;
    purchasable: boolean;
    isHcOnly: boolean;
    isStaffOverrideable: boolean;
    isAmbassadorOnly: boolean;
    isNotification: boolean;
    color: ImageBitmap | null;
    colorOffset: Point | null;
    overlap: Rectangle | null;
    allowHTML: boolean;
    styleSheet: IChatLinkStyleSheet | null;
    usePixelPerfectNineSlice: boolean;
}

/**
 * ChatStyle
 *
 * A single chat bubble style (skin) — background/pointer/emblem bitmaps,
 * text formatting, and the flags that decide who can use/see it.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as
 */
export class ChatStyle implements IChatStyle, IChatStyleInternal
{
    private readonly _background: ImageBitmap;
    private readonly _scale9Grid: Rectangle;
    private readonly _pointer: ImageBitmap | null;
    private readonly _pointerY: number;
    private readonly _pointerXMargins: number[] | null;
    private readonly _textFieldMargins: Rectangle;
    private readonly _textFormat: IChatTextFormat;
    private readonly _isAnonymous: boolean;
    private readonly _emblem: ImageBitmap | null;
    private readonly _emblemOffset: Point | null;
    private readonly _emblemMultiline: ImageBitmap | null;
    private readonly _emblemMultilineOffset: Point | null;
    private readonly _faceOffset: Point | null;
    private readonly _icon: ImageBitmap | null;
    private readonly _selectorPreview: ImageBitmap;
    private readonly _isSystemStyle: boolean;
    private readonly _purchasable: boolean;
    private readonly _isHcOnly: boolean;
    private readonly _isStaffOverrideable: boolean;
    private readonly _isAmbassadorOnly: boolean;
    private readonly _isNotification: boolean;
    private readonly _color: ImageBitmap | null;
    // AS3: colorOffset is stored but never actually read anywhere in ChatStyle
    // (getNewBackgroundSprite() draws `_color` at the origin regardless) — kept for fidelity.
    private readonly _colorOffset: Point | null;
    private readonly _overlap: Rectangle | null;
    private readonly _allowHTML: boolean;
    private readonly _styleSheet: IChatLinkStyleSheet | null;
    private readonly _usePixelPerfectNineSlice: boolean;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::ChatStyle()
    constructor(descriptor: IChatStyleDescriptor)
    {
        this._background = descriptor.background;
        this._scale9Grid = descriptor.scale9Grid;
        this._pointer = descriptor.pointer;
        this._pointerY = descriptor.pointerY;
        this._pointerXMargins = descriptor.pointerXMargins;
        this._textFieldMargins = descriptor.textFieldMargins;
        this._textFormat = descriptor.textFormat;
        this._isAnonymous = descriptor.isAnonymous;
        this._emblem = descriptor.emblem;
        this._emblemOffset = descriptor.emblemOffset;
        this._emblemMultiline = descriptor.emblemMultiline;
        this._emblemMultilineOffset = descriptor.emblemMultilineOffset;
        this._faceOffset = descriptor.faceOffset;
        this._icon = descriptor.icon;
        this._selectorPreview = descriptor.selectorPreview;
        this._isSystemStyle = descriptor.isSystemStyle;
        this._purchasable = descriptor.purchasable;
        this._isHcOnly = descriptor.isHcOnly;
        this._isStaffOverrideable = descriptor.isStaffOverrideable;
        this._isAmbassadorOnly = descriptor.isAmbassadorOnly;
        this._isNotification = descriptor.isNotification;
        this._color = descriptor.color;
        this._colorOffset = descriptor.colorOffset;
        this._overlap = descriptor.overlap;
        this._allowHTML = descriptor.allowHTML;
        this._styleSheet = descriptor.styleSheet;
        this._usePixelPerfectNineSlice = descriptor.usePixelPerfectNineSlice;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::getNewBackgroundSprite()
    getNewBackgroundSprite(tint: number = 0xFFFFFF): Container
    {
        let background = this._background;

        if(this._color)
        {
            const canvas = new OffscreenCanvas(this._background.width, this._background.height);
            const ctx = canvas.getContext('2d');

            if(ctx)
            {
                ctx.drawImage(this._background, 0, 0);

                const r = (tint >> 16) & 0xFF;
                const g = (tint >> 8) & 0xFF;
                const b = tint & 0xFF;

                // AS3: BitmapData.draw(_color, null, new ColorTransform(r/255,g/255,b/255), "darken")
                // — tint the color-mask bitmap by the requested color, then darken-blend
                // it over the plain background already drawn above (same technique as
                // @habbo/ui/widget/roomchat/style/ChatBubbleFactory::buildBubbleImage()).
                const tintCanvas = new OffscreenCanvas(this._color.width, this._color.height);
                const tintCtx = tintCanvas.getContext('2d');

                if(tintCtx)
                {
                    tintCtx.fillStyle = `rgb(${r},${g},${b})`;
                    tintCtx.fillRect(0, 0, tintCanvas.width, tintCanvas.height);
                    tintCtx.globalCompositeOperation = 'destination-in';
                    tintCtx.drawImage(this._color, 0, 0);

                    ctx.save();
                    ctx.globalCompositeOperation = 'darken';
                    ctx.drawImage(tintCanvas, 0, 0);
                    ctx.restore();
                }

                background = canvas.transferToImageBitmap();
            }
        }

        return this._usePixelPerfectNineSlice
            ? HabboFreeFlowChat.createPixelPerfectNineSliceSprite(this._scale9Grid, background)
            : HabboFreeFlowChat.createNineSliceSprite(this._scale9Grid, background);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::get textFormat()
    get textFormat(): IChatTextFormat
    {
        return this._textFormat;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::get styleSheet()
    get styleSheet(): IChatLinkStyleSheet | null
    {
        return this._styleSheet;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::get pointer()
    get pointer(): ImageBitmap | null
    {
        return this._pointer;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::get pointerOffsetToBubbleBottom()
    get pointerOffsetToBubbleBottom(): number
    {
        return this._background.height - this._pointerY;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::getPointerLeftMargin()
    getPointerLeftMargin(defaultValue: number): number
    {
        if(!this._pointerXMargins || this._pointerXMargins.length < 1) return defaultValue;

        return this._pointerXMargins[0];
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::getPointerRightMargin()
    getPointerRightMargin(defaultValue: number): number
    {
        if(!this._pointerXMargins || this._pointerXMargins.length < 2) return defaultValue;

        return this._pointerXMargins[1];
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::get isAnonymous()
    get isAnonymous(): boolean
    {
        return this._isAnonymous;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::get faceOffset()
    get faceOffset(): Point | null
    {
        return this._faceOffset;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::getEmblem()
    getEmblem(multiline: boolean = false): ImageBitmap | null
    {
        if(multiline && this._emblemMultiline && this._emblemMultilineOffset) return this._emblemMultiline;

        // AS3 gates the fallback on the single-line *offset*, not the bitmap itself.
        return this._emblemOffset !== null ? this._emblem : null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::getEmblemOffset()
    getEmblemOffset(multiline: boolean = false): Point | null
    {
        if(multiline && this._emblemMultiline && this._emblemMultilineOffset) return this._emblemMultilineOffset;

        return this._emblemOffset;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::get iconImage()
    // Not part of IChatStyle/IChatStyleInternal — consumed by concrete-typed callers
    // (e.g. the freeflowchat ChatBubbleFactory casts getStyle()'s result down to ChatStyle).
    get iconImage(): ImageBitmap | null
    {
        return this._icon;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::get textFieldMargins()
    get textFieldMargins(): Rectangle
    {
        return this._textFieldMargins;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::get overlap()
    get overlap(): Rectangle | null
    {
        return this._overlap;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::get selectorPreview()
    get selectorPreview(): ImageBitmap
    {
        return this._selectorPreview;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::get isSystemStyle()
    get isSystemStyle(): boolean
    {
        return this._isSystemStyle;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::get purchasable()
    get purchasable(): boolean
    {
        return this._purchasable;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::get isHcOnly()
    get isHcOnly(): boolean
    {
        return this._isHcOnly;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::get isAmbassadorOnly()
    get isAmbassadorOnly(): boolean
    {
        return this._isAmbassadorOnly;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::get isStaffOverrideable()
    get isStaffOverrideable(): boolean
    {
        return this._isStaffOverrideable;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::get allowHTML()
    get allowHTML(): boolean
    {
        return this._allowHTML;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyle.as::get isNotification()
    get isNotification(): boolean
    {
        return this._isNotification;
    }
}
