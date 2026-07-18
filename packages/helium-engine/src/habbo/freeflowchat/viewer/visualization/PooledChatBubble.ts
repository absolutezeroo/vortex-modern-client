import {Container, Sprite, Texture, Graphics} from 'pixi.js';
import type {FederatedPointerEvent} from 'pixi.js';
import type {IHabboFreeFlowChat} from '@habbo/freeflowchat/IHabboFreeFlowChat';
import type {ChatItem} from '@habbo/freeflowchat/data/ChatItem';
import {RoomSessionChatEvent} from '@habbo/session/events/RoomSessionChatEvent';
import {ChatBubbleWidth} from '../enum/ChatBubbleWidth';
import type {IChatStyleInternal} from './style/IChatStyleInternal';
import {buildChatTextRuns, layoutChatText, drawChatText} from './ChatTextLayout';

/** AS3: ChatBubble.as::LINEAR_INTERPOLATION_MS */
const LINEAR_INTERPOLATION_MS = 150;
const MAX_TEXT_HEIGHT_BASE = 108;
const DESKTOP_MARGIN_LEFT = 85;
const DESKTOP_MARGIN_RIGHT = 190;
// AS3: PooledChatBubble.as:23 — the hard content-width cap and the fallback when there
// are no room chat settings. Distinct from ChatBubbleWidth.NORMAL (350).
const MAX_WIDTH_DEFAULT = 300;

function clamp(value: number, min: number, max: number): number
{
    return Math.min(Math.max(value, min), max);
}

function lerp(a: number, b: number, t: number): number
{
    return a + (b - a) * t;
}

/**
 * PooledChatBubble
 *
 * A single freeflowchat speech bubble - background 9-slice, pointer, emblem,
 * face crop, and text, rebuilt in place on every `recreate()` call so the
 * factory can reuse instances across messages instead of allocating a new
 * display tree per chat line (see ChatBubbleFactory.getNewChatBubble()'s
 * pool). Composition logic mirrors ChatBubble.as's constructor - see
 * ChatTextLayout.ts's header for why text is built from flat styled runs
 * instead of real inline HTML.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/PooledChatBubble.as
 */
export class PooledChatBubble extends Container
{
    private _chatFlow: IHabboFreeFlowChat | null;
    private _chatItem: ChatItem | null = null;
    private _style: IChatStyleInternal | null = null;
    private _face: ImageBitmap | null = null;

    private _background: Container | null = null;
    private readonly _pointer: Sprite = new Sprite();
    private readonly _emblem: Sprite = new Sprite();
    private readonly _faceSprite: Sprite = new Sprite();
    private readonly _textSprite: Sprite = new Sprite();
    private readonly _clipMask: Graphics = new Graphics();

    private _minHeight: number = -1;
    private _useDesktopMargins: boolean = false;
    private _readyToRecycle: boolean = false;
    private _hasHitDesktopMargin: boolean = false;

    private _proxyX: number = 0;
    private _moveOriginX: number = 0;
    private _moveOriginY: number = 0;
    private _moveTargetX: number = 0;
    private _moveTargetY: number = 0;
    private _moveBeginMs: number = -1;
    private _timeMs: number = 0;
    private _roomPanOffsetX: number = 0;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/PooledChatBubble.as::PooledChatBubble()
    constructor(chatFlow: IHabboFreeFlowChat)
    {
        super();

        this._chatFlow = chatFlow;
        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.on('pointertap', this.onMouseClick, this);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/PooledChatBubble.as::set chatItem()
    set chatItem(value: ChatItem)
    {
        this._chatItem = value;
    }

    get chatItem(): ChatItem | null
    {
        return this._chatItem;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/PooledChatBubble.as::set style()
    set style(value: IChatStyleInternal)
    {
        this._style = value;
    }

    get style(): IChatStyleInternal | null
    {
        return this._style;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/PooledChatBubble.as::set face()
    set face(value: ImageBitmap | null)
    {
        this._face = value;
    }

    get face(): ImageBitmap | null
    {
        return this._face;
    }

    get chatFlow(): IHabboFreeFlowChat | null
    {
        return this._chatFlow;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/PooledChatBubble.as::get minHeight()
    get minHeight(): number
    {
        return this._minHeight;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/PooledChatBubble.as::recreate()
    recreate(userName: string, color: number, borderLimited: boolean = false, minHeight: number = -1): void
    {
        const style = this._style;
        const chatFlow = this._chatFlow;
        const item = this._chatItem;

        if(!style || !chatFlow || !item) return;

        this._minHeight = minHeight;

        // AS3 (PooledChatBubble.as:127) stores the borderLimited flag as _useDesktopMargins;
        // ChatBubbleFactory passes it true. The port never assigned it, so the proxyX
        // desktop-margin clamp never ran and _hasHitDesktopMargin stayed false forever.
        this._useDesktopMargins = borderLimited;

        // 1. Background
        if(this._background)
        {
            this.removeChild(this._background);
            this._background = null;
        }

        const background = style.getNewBackgroundSprite(color);

        this._background = background;

        // 2. Pointer
        this._pointer.texture = style.isAnonymous || !style.pointer ? Texture.EMPTY : Texture.from(style.pointer);

        // 3. Text metrics / max box
        const chatType = item.chatType;
        const isSpeak = chatType === RoomSessionChatEvent.CHAT_TYPE_SPEAK;
        const isShout = chatType === RoomSessionChatEvent.CHAT_TYPE_SHOUT;
        const italic = !isSpeak && !isShout && !style.isAnonymous;

        const maxHeight = MAX_TEXT_HEIGHT_BASE * chatFlow.chatFontSizeScale;
        // AS3 (PooledChatBubble.as:129) picks the text-field wrap width from the room chat
        // settings only (borderLimited plays no part here), falling back to MAX_WIDTH_DEFAULT.
        // The port gated on borderLimited, fell back to NORMAL (350), then subtracted an
        // invented 15 — all wrong.
        let maxWidth = MAX_WIDTH_DEFAULT;

        if(chatFlow.roomChatSettings)
        {
            maxWidth = ChatBubbleWidth.accordingToRoomChatSetting(chatFlow.roomChatSettings.bubbleWidth);
        }

        const margins = style.textFieldMargins;
        const fontFace = style.textFormat.fontFace;
        const fontSize = Math.max(1, Math.round(style.textFormat.fontSize * chatFlow.chatFontSizeScale));
        const linkColor = style.styleSheet ? Number(style.styleSheet.linkColor.replace('#', '0x')) : color;

        const runs = buildChatTextRuns(item.text, userName, style.isAnonymous, isShout, italic, color, linkColor, item.links);

        const measureCanvas = new OffscreenCanvas(1, 1);
        const measureCtx = measureCanvas.getContext('2d')!;
        const innerWidth = Math.max(1, maxWidth - margins.x - margins.width);
        const layout = layoutChatText(measureCtx, runs, fontFace, fontSize, innerWidth);
        const multiline = layout.lines.length > 1;

        // 4. Content box — AS3 (PooledChatBubble.as:182) hard-caps the background at
        // MAX_WIDTH_DEFAULT (300), independent of the wrap width above; the port capped at
        // maxWidth, so a WIDE (2000) setting let the bubble grow to ~1985px.
        let contentWidth = Math.min(MAX_WIDTH_DEFAULT, layout.width + margins.x + margins.width);
        let contentHeight = layout.height + margins.y + margins.height;

        if(!style.isSystemStyle) contentHeight = Math.min(maxHeight, contentHeight);
        if(this._minHeight !== -1) contentHeight = Math.max(this._minHeight, contentHeight);

        contentWidth = Math.max(contentWidth, background.width || 0);
        contentHeight = Math.max(contentHeight, background.height || 0);

        if(background.width > 0) background.width = contentWidth;
        if(background.height > 0) background.height = contentHeight;

        this.addChildAt(background, 0);

        // 5. Emblem
        const emblemBitmap = style.getEmblem(multiline);
        const emblemOffset = style.getEmblemOffset(multiline);

        if(emblemBitmap && emblemOffset)
        {
            this._emblem.texture = Texture.from(emblemBitmap);
            this._emblem.position.set(emblemOffset.x, emblemOffset.y);

            if(this._emblem.parent !== this) this.addChild(this._emblem);
        }
        else if(this._emblem.parent === this)
        {
            this.removeChild(this._emblem);
        }

        // 6. Pointer position/z-order
        if(!style.isAnonymous && style.pointer)
        {
            if(this._pointer.parent !== this) this.addChild(this._pointer);
        }
        else if(this._pointer.parent === this)
        {
            this.removeChild(this._pointer);
        }

        // 7. Face
        if(this._face && style.faceOffset)
        {
            let faceBitmap = this._face;

            if(faceBitmap.height > contentHeight)
            {
                const cropCanvas = new OffscreenCanvas(faceBitmap.width, Math.max(1, contentHeight));
                const cropCtx = cropCanvas.getContext('2d')!;

                cropCtx.drawImage(faceBitmap, 0, faceBitmap.height - contentHeight, faceBitmap.width, contentHeight, 0, 0, faceBitmap.width, contentHeight);
                faceBitmap = cropCanvas.transferToImageBitmap();
            }

            this._faceSprite.texture = Texture.from(faceBitmap);
            this._faceSprite.position.set(style.faceOffset.x - faceBitmap.width / 2, Math.max(1, style.faceOffset.y - faceBitmap.height / 2));

            if(style.isNotification)
            {
                // AS3 (PooledChatBubble.as:257-265) centres on the full measured bubble
                // height (this.height), not the content box, and nudges x back half a pixel.
                this._faceSprite.y = Math.max(1, this.height / 2 - faceBitmap.height / 2);
                this._faceSprite.x -= 0.5;

                if(!style.isAnonymous) this._faceSprite.y -= this._pointer.texture.height / 2 - 1;
            }

            if(this._faceSprite.parent !== this) this.addChild(this._faceSprite);
        }
        else if(this._faceSprite.parent === this)
        {
            this.removeChild(this._faceSprite);
        }

        // 8. Text
        const textCanvas = new OffscreenCanvas(Math.max(1, layout.width), Math.max(1, layout.height));
        const textCtx = textCanvas.getContext('2d')!;

        drawChatText(textCtx, layout, fontFace, fontSize);

        this._textSprite.texture = Texture.from(textCanvas.transferToImageBitmap());
        this._textSprite.position.set(margins.x, margins.y);

        if(this._textSprite.parent !== this) this.addChild(this._textSprite);

        // 9. Overflow clip mask (non-system styles only)
        if(this._clipMask.parent === this) this.removeChild(this._clipMask);

        if(!style.isSystemStyle && layout.height > maxHeight - margins.height)
        {
            this._clipMask.clear();
            this._clipMask.rect(0, 0, layout.width + 5, Math.max(1, maxHeight - margins.height));
            this._clipMask.fill(0xFFFFFF);
            this._clipMask.position.set(margins.x, margins.y);
            this.addChild(this._clipMask);
            this._textSprite.mask = this._clipMask;
        }
        else
        {
            this._textSprite.mask = null;
        }

        this.repositionPointer();

        this._readyToRecycle = false;
        this._timeMs = 0;
        this._moveBeginMs = -1;
        this.visible = false;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/PooledChatBubble.as::unregister()
    unregister(): void
    {
        if(this._clipMask.parent === this) this.removeChild(this._clipMask);
        if(this._textSprite.parent === this) this.removeChild(this._textSprite);
        if(this._faceSprite.parent === this) this.removeChild(this._faceSprite);
        if(this._emblem.parent === this) this.removeChild(this._emblem);
        if(this._pointer.parent === this) this.removeChild(this._pointer);

        if(this._background)
        {
            if(this._background.parent === this) this.removeChild(this._background);
            this._background = null;
        }

        this._textSprite.mask = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/ChatBubble.as::moveTo()
    moveTo(x: number, y: number): void
    {
        // AS3 (PooledChatBubble.as:359) only restarts the tween when the target actually
        // changes. ChatFlowStage.update() calls syncToVisualization() -> moveTo() every
        // frame with the same target, so without this guard _moveBeginMs was reset to now
        // each frame, elapsed never grew past a frame delta, and the bubble crept toward
        // its target geometrically instead of the intended 150 ms linear tween.
        if(this._moveTargetX !== x || this._moveTargetY !== y)
        {
            this._moveOriginX = this._proxyX;
            this._moveOriginY = this.y;
            this._moveTargetX = x;
            this._moveTargetY = y;
            this._moveBeginMs = this._timeMs;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/ChatBubble.as::warpTo()
    warpTo(x: number, y: number): void
    {
        // AS3 (PooledChatBubble.as:371) also sets the tween target, so a following
        // moveTo() to the same spot is a no-op (its guard skips) rather than a dead tween.
        this._moveTargetX = x;
        this._moveTargetY = y;
        this._moveBeginMs = -1;
        this.proxyX = x;
        this.y = y;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/PooledChatBubble.as::update()
    update(deltaMs: number): void
    {
        this._timeMs += deltaMs;

        if(this._moveBeginMs >= 0)
        {
            const elapsed = this._timeMs - this._moveBeginMs;

            if(elapsed < LINEAR_INTERPOLATION_MS)
            {
                const t = elapsed / LINEAR_INTERPOLATION_MS;

                this.proxyX = lerp(this._moveOriginX, this._moveTargetX, t);
                this.y = lerp(this._moveOriginY, this._moveTargetY, t);
            }
            else
            {
                this.proxyX = this._moveTargetX;
                this.y = this._moveTargetY;
                this._moveBeginMs = -1;
            }
        }

        this.repositionPointer();

        // AS3 gates `visible` on total elapsed time since recreate() exceeding
        // 150ms, unconditionally - NOT on a moveTo() tween completing. warpTo()
        // (the instant-spawn path ChatFlowViewer always uses in Plan 1, since
        // there's no moveTo()-driven approach animation yet) never sets
        // _moveBeginMs, so gating visibility on the tween branch above would
        // leave every spawned bubble permanently invisible.
        if(this._timeMs > LINEAR_INTERPOLATION_MS && !this.visible)
        {
            this.visible = true;
        }
    }

    get proxyX(): number
    {
        return this._proxyX;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/PooledChatBubble.as::set proxyX()
    // recreate() now sets _useDesktopMargins from the borderLimited flag ChatBubbleFactory
    // passes, so this clamp runs. Both branches offset by _roomPanOffsetX (AS3 clamps
    // proxyX + roomPanOffsetX, not proxyX). window.innerWidth stands in for AS3's
    // stage.stageWidth (this port renders one full-window canvas, not a Flash stage).
    set proxyX(value: number)
    {
        this._proxyX = value;

        if(this._useDesktopMargins)
        {
            const stageWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
            let target = value + this._roomPanOffsetX;
            const max = stageWidth - DESKTOP_MARGIN_RIGHT - this.width;

            this._hasHitDesktopMargin = false;

            if(target > max)
            {
                target = max;
                this._hasHitDesktopMargin = true;
            }

            if(target < DESKTOP_MARGIN_LEFT)
            {
                target = DESKTOP_MARGIN_LEFT;
                this._hasHitDesktopMargin = true;
            }

            this.x = target;
        }
        else
        {
            this.x = value + this._roomPanOffsetX;
            this._hasHitDesktopMargin = false;
        }
    }

    set useDesktopMargins(value: boolean)
    {
        this._useDesktopMargins = value;
    }

    get roomPanOffsetX(): number
    {
        return this._roomPanOffsetX;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/ChatBubble.as::set roomPanOffsetX()
    set roomPanOffsetX(value: number)
    {
        if(value === this._roomPanOffsetX) return;

        this._roomPanOffsetX = value;
        this.warpTo(this._proxyX, this.y);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/ChatBubble.as::repositionPointer()
    repositionPointer(): void
    {
        const style = this._style;

        if(!style || style.isAnonymous || this._pointer.parent !== this) return;

        const userRelativeX = this.userScreenPos.x - this.x;
        const leftMargin = style.getPointerLeftMargin(28);
        const rightMargin = this._background ? this._background.width - style.getPointerRightMargin(15) : 0;

        this._pointer.x = clamp(userRelativeX, leftMargin, Math.max(leftMargin, rightMargin));
        this._pointer.y = (this._background?.height ?? 0) - style.pointerOffsetToBubbleBottom;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/ChatBubble.as::get userScreenPos()
    get userScreenPos(): {x: number; y: number}
    {
        const item = this._chatItem;

        if(!item || !this._chatFlow) return {x: 0, y: 0};

        if(item.forcedScreenLocation !== null && item.forcedScreenLocation !== undefined)
        {
            const stageWidth = typeof window !== 'undefined' ? window.innerWidth : 0;

            return {x: stageWidth / 2 + Number(item.forcedScreenLocation), y: 500};
        }

        if(!item.userLocation) return {x: 0, y: 0};

        return this._chatFlow.getScreenPointFromRoomLocation(item.roomId, item.userLocation);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/ChatBubble.as::get displayedHeight()
    get displayedHeight(): number
    {
        if(!this._style) return this.height;

        return this._style.isSystemStyle ? this.height : Math.min(MAX_TEXT_HEIGHT_BASE * (this._chatFlow?.chatFontSizeScale ?? 1), this.height);
    }

    get overlap()
    {
        return this._style?.overlap ?? null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/PooledChatBubble.as::get scrolledUserPositionX()
    get scrolledUserPositionX(): number
    {
        const offset = this._chatFlow?.roomEngine?.getRoomCanvasScreenOffset(this.roomId) ?? null;

        return this.userScreenPos.x - (offset?.x ?? 0);
    }

    get hasHitDesktopMargin(): boolean
    {
        return this._hasHitDesktopMargin;
    }

    get roomId(): number
    {
        return this._chatItem?.roomId ?? 0;
    }

    get timeStamp(): number
    {
        return this._chatItem?.timeStamp ?? 0;
    }

    get readyToRecycle(): boolean
    {
        return this._readyToRecycle;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/ChatBubble.as::set readyToRecycle()
    set readyToRecycle(value: boolean)
    {
        this._readyToRecycle = value;

        if(value) this.off('pointertap', this.onMouseClick, this);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/ChatBubble.as::onMouseClick()
    private onMouseClick(event: FederatedPointerEvent): void
    {
        if(!this._style || this._style.isAnonymous || !this._chatFlow || !this._chatItem) return;

        if(!this._chatFlow.clickHasToPropagate(event))
        {
            this._chatFlow.selectAvatarWithChatItem(this._chatItem);
            event.stopPropagation();
        }
    }
}
