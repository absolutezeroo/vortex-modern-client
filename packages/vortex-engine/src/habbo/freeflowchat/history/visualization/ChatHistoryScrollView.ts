import {Container, Graphics, Rectangle, Sprite, Texture, type FederatedPointerEvent, type FederatedWheelEvent} from 'pixi.js';
import {AssetBitmap} from '@core/assets/AssetBitmap';
import type {IDisposable} from '@core/runtime';
import {SmoothScroller} from '@core/window/utils/SmoothScroller';
import {NativeWheelDelta} from '@core/window/utils/NativeWheelDelta';
import {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboFreeFlowChat} from '../../HabboFreeFlowChat';
import type {ChatHistoryBuffer} from '../ChatHistoryBuffer';
import type {IChatHistoryEntry} from './entry/IChatHistoryEntry';
import {BitmapSpriteWithUserId} from './entry/BitmapSpriteWithUserId';
import {ChatHistoryScrollBar} from './ChatHistoryScrollBar';
import {ChatHistoryVisualizationEnum} from './enum/ChatHistoryVisualizationEnum';

/**
 * The scrollback itself: every row in the buffer, stacked, clipped to the tray's current width,
 * and draggable.
 *
 * Three things move `topY`, and they are deliberately kept apart because each cancels the others:
 * a **drag** (pointer or scroll bar) writes it directly, the **wheel** goes through a
 * `SmoothScroller`, and two eased animations — the **springback** that pulls an over-scroll back
 * into range, and the **auto-scroll** that follows new chat when the view is already at the bottom.
 * `update()` drives the last two; the first two cancel both on the way in.
 *
 * "Most recent history mode" is what makes new chat follow: it is on while the view sits within
 * `MOST_RECENT_HISTORY_BOTTOM_PADDING_THRESHOLD` of the bottom, and any deliberate scroll turns it
 * off.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/ChatHistoryScrollView.as
 */
export class ChatHistoryScrollView implements IDisposable
{
    // AS3: .../ChatHistoryScrollView.as::SPRINGBACK_DURATION_MS
    private static readonly SPRINGBACK_DURATION_MS: number = 180;
    // AS3: .../ChatHistoryScrollView.as::AUTO_SCROLL_TO_LATEST_DURATION_MS
    private static readonly AUTO_SCROLL_TO_LATEST_DURATION_MS: number = 140;

    /**
     * How much of the buffer stays reachable past each end before the springback pulls back. Both
     * are 200 and AS3 keeps them as two separate constants (`_SafeStr_10801`, `_SafeStr_11400`),
     * one consulted per end; the names here are DERIVED from which end each is read at.
     */
    // AS3: .../ChatHistoryScrollView.as::_SafeStr_10801
    private static readonly TOP_SPRINGBACK_MARGIN: number = 200;
    // AS3: .../ChatHistoryScrollView.as::_SafeStr_11400
    private static readonly BOTTOM_SPRINGBACK_MARGIN: number = 200;

    // AS3: .../ChatHistoryScrollView.as::MOST_RECENT_HISTORY_BOTTOM_PADDING_THRESHOLD
    private static readonly MOST_RECENT_HISTORY_BOTTOM_PADDING_THRESHOLD: number = 100;

    // AS3: .../ChatHistoryScrollView.as::_SafeStr_10363 — name not recovered; it is the
    // SmoothScroller duration this view hands the wheel, in ms.
    private static readonly WHEEL_SCROLL_DURATION_MS: number = 200;

    // AS3: .../ChatHistoryScrollView.as::_rootDisplayObject
    private _rootDisplayObject: Container | null = new Container();
    // AS3: .../ChatHistoryScrollView.as::_entrySprites
    private _entrySprites: BitmapSpriteWithUserId[] = [];
    // AS3: .../ChatHistoryScrollView.as::_topY
    private _topY: number = 0;
    // AS3: .../ChatHistoryScrollView.as::_viewPort
    private _viewPort: Rectangle | null = null;
    // AS3: .../ChatHistoryScrollView.as::_visibleWidth
    private _visibleWidth: number = 0;
    // AS3: .../ChatHistoryScrollView.as::_dragStartY
    private _dragStartY: number = 0;
    // AS3: .../ChatHistoryScrollView.as::_dragStartTopY
    private _dragStartTopY: number = 0;
    // AS3: .../ChatHistoryScrollView.as::_clipMask
    private _clipMask: Graphics | null = null;
    // AS3: .../ChatHistoryScrollView.as::_inputSurface
    private _inputSurface: Graphics | null = new Graphics();
    // AS3: .../ChatHistoryScrollView.as::_isActive
    private _isActive: boolean = false;
    // AS3: .../ChatHistoryScrollView.as::_scrollBar
    private readonly _scrollBar: ChatHistoryScrollBar;
    // AS3: .../ChatHistoryScrollView.as::_ignore
    private _ignore: Sprite | null = null;
    // AS3: .../ChatHistoryScrollView.as::_ignoreTarget
    private _ignoreTarget: BitmapSpriteWithUserId | null = null;
    // AS3: .../ChatHistoryScrollView.as::_smoothScroller
    private _smoothScroller: SmoothScroller | null = null;
    // AS3: .../ChatHistoryScrollView.as::_isDragging
    private _isDragging: boolean = false;
    // AS3: .../ChatHistoryScrollView.as::_springbackActive
    private _springbackActive: boolean = false;
    // AS3: .../ChatHistoryScrollView.as::_springbackStartTopY
    private _springbackStartTopY: number = 0;
    // AS3: .../ChatHistoryScrollView.as::_springbackTargetTopY
    private _springbackTargetTopY: number = 0;
    // AS3: .../ChatHistoryScrollView.as::_springbackElapsedMs
    private _springbackElapsedMs: number = 0;
    // AS3: .../ChatHistoryScrollView.as::_autoScrollActive
    private _autoScrollActive: boolean = false;
    // AS3: .../ChatHistoryScrollView.as::_autoScrollStartTopY
    private _autoScrollStartTopY: number = 0;
    // AS3: .../ChatHistoryScrollView.as::_autoScrollTargetTopY
    private _autoScrollTargetTopY: number = 0;
    // AS3: .../ChatHistoryScrollView.as::_autoScrollElapsedMs
    private _autoScrollElapsedMs: number = 0;
    // AS3: .../ChatHistoryScrollView.as::_isMostRecentHistoryMode
    private _mostRecentHistoryMode: boolean = false;
    // AS3: .../ChatHistoryScrollView.as::_bottomPadding
    private _bottomPadding: number = ChatHistoryVisualizationEnum.ENTRY_DEFAULT_BOTTOM_PADDING;

    /**
     * DEVIATION: AS3 waits for `addedToStage` and reads `stage.stageWidth/stageHeight`, then keeps
     *   a `stage.resize` subscription for as long as scrolling is active. This port has one canvas
     *   sized to the window (`Vortex.ts`'s `resizeTo: window`), so the viewport comes from
     *   `window.innerWidth/innerHeight` and the subscription is a `window` resize listener held for
     *   the view's whole life — the same stand-in `ChatViewController` already uses for the chat
     *   flow viewer.
     */
    // DEVIATION: see the block above.
    // AS3: .../ChatHistoryScrollView.as::onStageResized()
    private readonly onWindowResized = (): void =>
    {
        this.applyStageViewPort();
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/ChatHistoryScrollView.as::ChatHistoryScrollView()
    constructor(private readonly _chatFlow: HabboFreeFlowChat, private readonly _historyBuffer: ChatHistoryBuffer)
    {
        const root = this._rootDisplayObject as Container;

        root.x = 0;
        root.y = 0;
        root.addChild(this._inputSurface as Graphics);

        this._scrollBar = new ChatHistoryScrollBar(this, _chatFlow);

        const ignoreBitmap = AssetBitmap.resolveSync(_chatFlow.assets?.getAssetByName('close_x')?.content ?? null);

        this._ignore = new Sprite(ignoreBitmap === null ? Texture.EMPTY : Texture.from(ignoreBitmap));

        this._smoothScroller = new SmoothScroller(
            () => this._topY,
            (value: number) => this.setTopY(Math.round(value), true),
            () => 1,
            ChatHistoryScrollView.WHEEL_SCROLL_DURATION_MS,
            60,
            false,
            () => this.onWheelScrollCompleted(),
            NaN,
            false
        );

        if(typeof window !== 'undefined') window.addEventListener('resize', this.onWindowResized);

        this.applyStageViewPort();
    }

    // AS3: .../ChatHistoryScrollView.as::get disposed()
    get disposed(): boolean
    {
        return this._clipMask === null && this._rootDisplayObject === null;
    }

    // AS3: .../ChatHistoryScrollView.as::get rootDisplayObject()
    get rootDisplayObject(): Container | null
    {
        return this._rootDisplayObject;
    }

    // AS3: .../ChatHistoryScrollView.as::get topY()
    get topY(): number
    {
        return this._topY;
    }

    // AS3: .../ChatHistoryScrollView.as::set topY()
    set topY(value: number)
    {
        this.setTopY(value, false);
    }

    // AS3: .../ChatHistoryScrollView.as::get bufferHeight()
    get bufferHeight(): number
    {
        return this._historyBuffer.totalHeight;
    }

    // AS3: .../ChatHistoryScrollView.as::get isActive()
    get isActive(): boolean
    {
        return this._isActive;
    }

    // AS3: .../ChatHistoryScrollView.as::get isMostRecentHistoryMode()
    get isMostRecentHistoryMode(): boolean
    {
        return this._mostRecentHistoryMode || this.isViewingMostRecentChatsWithBuffer();
    }

    // AS3: .../ChatHistoryScrollView.as::get viewPort()
    get viewPort(): Rectangle | null
    {
        return this._viewPort;
    }

    /**
     * The full-height column the rows live in. Setting it (re)builds the clip mask, the input
     * surface and the scroll bar's position, and resets the bottom padding while the view is
     * following new chat, so a window resize does not knock it out of that mode.
     */
    // AS3: .../ChatHistoryScrollView.as::set viewPort()
    set viewPort(value: Rectangle | null)
    {
        if(value === null || this._rootDisplayObject === null) return;

        this._viewPort = value;

        if(this._clipMask === null)
        {
            this._clipMask = new Graphics();
            this._rootDisplayObject.addChild(this._clipMask);
        }

        this.updateClipMask();
        this.updateInputSurface();
        this.updateScrollBarPosition();

        this.viewBottom = value.height;

        if(this._mostRecentHistoryMode) this._bottomPadding = this.getCurrentBottomPadding();
    }

    // AS3: .../ChatHistoryScrollView.as::set viewBottom()
    set viewBottom(value: number)
    {
        if(this._rootDisplayObject === null || this._viewPort === null) return;

        this._rootDisplayObject.y = value - this._viewPort.height;
        this._scrollBar.height = value;
        this._scrollBar.displayObject.y = this._viewPort.height - value;
    }

    /** How much of the column the tray currently uncovers — 0 while it is shut. */
    // AS3: .../ChatHistoryScrollView.as::set viewWidth()
    set viewWidth(value: number)
    {
        this._visibleWidth = value;

        this.updateClipMask();
        this.updateInputSurface();
        this.updateScrollBarPosition();
    }

    /**
     * Rebuilds every row from the buffer.
     *
     * Rows are stacked from `-topY` downwards, each one pulled up by its own `overlap.y` first so a
     * bubble's pointer tucks under the row above it.
     */
    // AS3: .../ChatHistoryScrollView.as::activateView()
    activateView(): void
    {
        if(this._rootDisplayObject === null) return;

        this.deactivateView();

        const entries = this._historyBuffer.entries;

        this._entrySprites = [];

        let y = -this._topY;

        for(const entry of entries)
        {
            const sprite = new BitmapSpriteWithUserId();

            sprite.roomId = entry.roomId;
            sprite.userIndex = entry.userIndex;
            sprite.webId = entry.webId;
            sprite.bitmapData = entry.bitmap;
            sprite.canIgnore = entry.canIgnore;
            sprite.userName = entry.userName;

            y -= entry.overlap?.y ?? 0;
            sprite.y = y;
            sprite.x = ChatHistoryVisualizationEnum.LEFT_MARGIN;
            y += (entry.bitmap?.height ?? 0) - ChatHistoryVisualizationEnum.ROW_HEIGHT_OVERLAP;

            this._entrySprites.push(sprite);
            this._rootDisplayObject.addChild(sprite);
        }

        this._rootDisplayObject.addChild(this._scrollBar.displayObject);
        this._isActive = true;
        this._scrollBar.updateThumbTrack();
    }

    // AS3: .../ChatHistoryScrollView.as::deactivateView()
    deactivateView(): void
    {
        if(this.disposed || this._rootDisplayObject === null) return;

        for(const sprite of this._entrySprites)
        {
            this._rootDisplayObject.removeChild(sprite);
            sprite.bitmapData = null;
        }

        if(this._ignoreTarget !== null)
        {
            if(this._ignore !== null) this._rootDisplayObject.removeChild(this._ignore);

            this._ignoreTarget = null;
        }

        this._entrySprites = [];

        if(this._scrollBar.displayObject.parent === this._rootDisplayObject)
        {
            this._rootDisplayObject.removeChild(this._scrollBar.displayObject);
        }

        this._isActive = false;
    }

    /**
     * DEVIATION: AS3 adds and removes four listeners (`mouseDown`/`mouseWheel` on the root,
     *   `mouseMove`/`mouseUp` on the stage). PixiJS routes everything through hit testing, so the
     *   listeners live on the input surface for good and this pair toggles whether that surface is
     *   hit-testable at all — which is what having no listeners amounted to.
     */
    // DEVIATION: see the block above.
    // AS3: .../ChatHistoryScrollView.as::activateScrolling()
    activateScrolling(): void
    {
        this.deactivateScrolling();

        if(this._inputSurface === null) return;

        this._inputSurface.eventMode = 'static';
        this._inputSurface.on('pointerdown', this.onPointerDown, this);
        this._inputSurface.on('globalpointermove', this.onPointerMove, this);
        this._inputSurface.on('pointerup', this.onPointerUp, this);
        this._inputSurface.on('pointerupoutside', this.onPointerUp, this);
        this._inputSurface.on('wheel', this.onWheel, this);
    }

    // AS3: .../ChatHistoryScrollView.as::deactivateScrolling()
    deactivateScrolling(): void
    {
        if(this._inputSurface !== null)
        {
            this._inputSurface.eventMode = 'none';
            this._inputSurface.off('pointerdown', this.onPointerDown, this);
            this._inputSurface.off('globalpointermove', this.onPointerMove, this);
            this._inputSurface.off('pointerup', this.onPointerUp, this);
            this._inputSurface.off('pointerupoutside', this.onPointerUp, this);
            this._inputSurface.off('wheel', this.onWheel, this);
        }

        this._isDragging = false;
        this.stopScrollWheel();
    }

    /**
     * Re-lays every row out for the new `topY`.
     *
     * `fromSmoothScroller` exists so the wheel animation does not fight itself: any *other* writer
     * shifts the scroller's own start position by the same delta, so an in-flight wheel glide keeps
     * its remaining distance instead of snapping back.
     */
    // AS3: .../ChatHistoryScrollView.as::setTopY()
    private setTopY(value: number, fromSmoothScroller: boolean): void
    {
        const delta = value - this._topY;

        this._topY = value;

        const entries = this._historyBuffer.entries;
        let y = -this._topY;

        for(let i = 0; i < entries.length; i++)
        {
            if(this._entrySprites.length <= i) break;

            const entry = entries[i];

            y -= entry.overlap?.y ?? 0;
            this._entrySprites[i].y = y;
            y += (entry.bitmap?.height ?? 0) - ChatHistoryVisualizationEnum.ROW_HEIGHT_OVERLAP;
        }

        if(this._ignoreTarget !== null && this._ignore !== null)
        {
            this._ignore.y = this._ignoreTarget.y + (this._ignoreTarget.height - this._ignore.height) / 2;
        }

        this._scrollBar.updateThumbTrack();

        if(!fromSmoothScroller && this._smoothScroller !== null && this._smoothScroller.isScrolling)
        {
            this._smoothScroller.adjustStartPosition(delta);
        }
    }

    /**
     * Appends one freshly-baked row while the view is open.
     *
     * The row's y comes from the buffer's *new* total height rather than from the last sprite,
     * which is what keeps it aligned after an overflow splice.
     */
    // AS3: .../ChatHistoryScrollView.as::addHistoryEntry()
    addHistoryEntry(entry: IChatHistoryEntry): void
    {
        if(this._rootDisplayObject === null) return;

        const wasFollowing = this._mostRecentHistoryMode;
        const sprite = new BitmapSpriteWithUserId();

        sprite.bitmapData = entry.bitmap;
        sprite.y = -this._topY + this._historyBuffer.totalHeight - (entry.bitmap?.height ?? 0) + ChatHistoryVisualizationEnum.ROW_HEIGHT_OVERLAP;
        sprite.x = ChatHistoryVisualizationEnum.LEFT_MARGIN;
        sprite.userIndex = entry.userIndex;
        sprite.webId = entry.webId;
        sprite.roomId = entry.roomId;
        sprite.canIgnore = entry.canIgnore;
        sprite.userName = entry.userName;

        this._entrySprites.push(sprite);
        this._rootDisplayObject.addChild(sprite);

        if(wasFollowing) this.startAutoScrollToLatest();

        this._scrollBar.updateThumbTrack();
    }

    // AS3: .../ChatHistoryScrollView.as::scrollUpAndSpliceTopItem()
    scrollUpAndSpliceTopItem(height: number): void
    {
        if(this._rootDisplayObject === null || this._entrySprites.length === 0) return;

        this._rootDisplayObject.removeChild(this._entrySprites[0]);
        this._entrySprites.splice(0, 1);

        for(const sprite of this._entrySprites) sprite.y -= height;

        this._scrollBar.updateThumbTrack();
    }

    /** Jumps to the newest row and turns following back on. */
    // AS3: .../ChatHistoryScrollView.as::scrollToBottom()
    scrollToBottom(): void
    {
        if(this._viewPort === null) return;

        this.topY = this._historyBuffer.totalHeight - this._viewPort.height + ChatHistoryVisualizationEnum.ENTRY_DEFAULT_BOTTOM_PADDING;
        this._mostRecentHistoryMode = true;
        this._bottomPadding = ChatHistoryVisualizationEnum.ENTRY_DEFAULT_BOTTOM_PADDING;

        this.cancelAutoScrollToLatest();
    }

    /**
     * Everything a deliberate scroll has to stand down first.
     *
     * `endWheel` is false when the wheel *is* the interaction, so it does not cancel itself.
     */
    // AS3: .../ChatHistoryScrollView.as::beginUserScrollInteraction()
    beginUserScrollInteraction(endWheel: boolean = true): void
    {
        this._mostRecentHistoryMode = false;

        this.cancelSpringback();
        this.cancelAutoScrollToLatest();

        if(endWheel) this.endScrollWheel(false);
    }

    // AS3: .../ChatHistoryScrollView.as::stopScrollWheel()
    stopScrollWheel(): void
    {
        this.endScrollWheel(false);
        this.cancelSpringback();
        this.cancelAutoScrollToLatest();
    }

    // AS3: .../ChatHistoryScrollView.as::scrollWithWheel()
    scrollWithWheel(delta: number): void
    {
        this.cancelSpringback();
        this._smoothScroller?.scrollWithWheel(delta);
    }

    /**
     * Drives both eased animations. Called by the tray, which is the update receiver — this view
     * registers for nothing itself.
     *
     * Both use the same cubic ease-out; the auto-scroll runs first so a springback started in the
     * same frame wins, which is the order AS3 writes them in.
     */
    // AS3: .../ChatHistoryScrollView.as::update()
    update(deltaMs: number): void
    {
        if(this._autoScrollActive)
        {
            this._autoScrollElapsedMs += deltaMs;

            const progress = Math.min(1, this._autoScrollElapsedMs / ChatHistoryScrollView.AUTO_SCROLL_TO_LATEST_DURATION_MS);
            const eased = 1 - Math.pow(1 - progress, 3);

            this.topY = Math.round(this._autoScrollStartTopY + (this._autoScrollTargetTopY - this._autoScrollStartTopY) * eased);

            if(progress >= 1)
            {
                this.topY = this._autoScrollTargetTopY;
                this.cancelAutoScrollToLatest();
            }
        }

        if(!this._springbackActive) return;

        this._springbackElapsedMs += deltaMs;

        const progress = Math.min(1, this._springbackElapsedMs / ChatHistoryScrollView.SPRINGBACK_DURATION_MS);
        const eased = 1 - Math.pow(1 - progress, 3);

        this.topY = Math.round(this._springbackStartTopY + (this._springbackTargetTopY - this._springbackStartTopY) * eased);

        if(progress >= 1)
        {
            this.topY = this._springbackTargetTopY;
            this.cancelSpringback();
        }
    }

    // AS3: .../ChatHistoryScrollView.as::startSpringbackIfNeeded()
    startSpringbackIfNeeded(): void
    {
        this.syncMostRecentHistoryMode();
        this.cancelAutoScrollToLatest();

        if(this._viewPort === null)
        {
            this.cancelSpringback();

            return;
        }

        const target = this.getSpringbackTargetTopY();

        if(Number.isNaN(target) || Math.round(target) === this._topY)
        {
            this.cancelSpringback();

            return;
        }

        this._springbackActive = true;
        this._springbackStartTopY = this._topY;
        this._springbackTargetTopY = Math.round(target);
        this._springbackElapsedMs = 0;
    }

    // TS-only: the `stage.stageWidth/stageHeight` read AS3 does in both onAddedToStage() and
    // onStageResized(), against this port's one window-sized canvas.
    private applyStageViewPort(): void
    {
        if(typeof window === 'undefined') return;

        this.viewPort = new Rectangle(
            0,
            0,
            window.innerWidth,
            window.innerHeight - ChatHistoryVisualizationEnum.TRAY_TOOLBAR_BOTTOM_MARGIN
        );
    }

    /** The column the tray has opened, as a mask over the full-height row stack. */
    // AS3: .../ChatHistoryScrollView.as::updateClipMask()
    private updateClipMask(): void
    {
        if(this._clipMask === null || this._viewPort === null || this._rootDisplayObject === null) return;

        const width = Math.max(0, Math.min(this._viewPort.width, this._visibleWidth));

        this._clipMask.clear();

        if(width <= 0) return;

        this._clipMask.rect(0, 0, width, this._viewPort.height).fill(0xFFFFFF);
        this._rootDisplayObject.mask = this._clipMask;
    }

    /**
     * The invisible rectangle that catches drags and wheels. It is drawn at alpha 0 rather than
     * left empty because hit testing needs geometry, exactly as AS3's `beginFill(0, 0)` did.
     */
    // AS3: .../ChatHistoryScrollView.as::updateInputSurface()
    private updateInputSurface(): void
    {
        if(this._inputSurface === null) return;

        this._inputSurface.clear();

        if(this._viewPort === null || this._visibleWidth <= 0) return;

        this._inputSurface.rect(0, 0, this._visibleWidth, this._viewPort.height).fill({color: 0, alpha: 0});
    }

    // AS3: .../ChatHistoryScrollView.as::updateScrollBarPosition()
    private updateScrollBarPosition(): void
    {
        if(this._viewPort === null) return;

        const width = this._visibleWidth > 0 ? this._visibleWidth : this._viewPort.width;

        this._scrollBar.displayObject.x = Math.max(
            0,
            width - this._scrollBar.displayObject.width - ChatHistoryScrollBar.RIGHT_MARGIN
        );
    }

    // AS3: .../ChatHistoryScrollView.as::findSpriteAtY()
    private findSpriteAtY(y: number): BitmapSpriteWithUserId | null
    {
        for(const sprite of this._entrySprites)
        {
            if(y >= sprite.y && y <= sprite.y + sprite.height) return sprite;
        }

        return null;
    }

    /**
     * AS3 compares the event's *stage* Y against the sprites' own local y, which only works because
     * `set viewPort()` leaves `rootDisplayObject.y` at 0 (`viewBottom` is set to the viewport's own
     * height). The same holds here, and the same comparison is kept rather than converting, so the
     * two stay wrong or right together.
     */
    // AS3: .../ChatHistoryScrollView.as::mouseDragEventHandler()
    private onPointerDown(event: FederatedPointerEvent): void
    {
        if(this._rootDisplayObject === null || this._viewPort === null) return;

        if(event.global.y >= this._rootDisplayObject.y + this._viewPort.height) return;
        if(event.global.x >= this._scrollBar.displayObject.x) return;

        this.beginUserScrollInteraction();
        this._scrollBar.cancelScroll();

        this._dragStartY = event.global.y;
        this._dragStartTopY = this.topY;
        this._isDragging = true;
    }

    // AS3: .../ChatHistoryScrollView.as::mouseDragEventHandler()
    private onPointerMove(event: FederatedPointerEvent): void
    {
        if(!this._isDragging) return;

        this.topY = this._dragStartTopY - (event.global.y - this._dragStartY);

        event.stopImmediatePropagation();
    }

    /**
     * A release that moved less than a pixel is a click, not a drag: it either hits the ignore
     * button or selects the row's avatar and offers the button on that row.
     */
    // AS3: .../ChatHistoryScrollView.as::mouseDragEventHandler()
    private onPointerUp(event: FederatedPointerEvent): void
    {
        if(!this._isDragging) return;

        this._isDragging = false;

        const moved = event.global.y - this._dragStartY;

        if(moved < 1 && moved > -1)
        {
            if(this.hitIgnore(event.global.x, event.global.y))
            {
                this.startSpringbackIfNeeded();

                return;
            }

            const sprite = this.findSpriteAtY(event.global.y);

            if(sprite !== null)
            {
                this.onEntrySpriteClicked(sprite);
                this.moveIgnore(sprite);
            }
        }

        this.startSpringbackIfNeeded();
    }

    // AS3: .../ChatHistoryScrollView.as::mouseWheelEventHandler()
    private onWheel(event: FederatedWheelEvent): void
    {
        this.beginUserScrollInteraction(false);
        this.scrollWithWheel(NativeWheelDelta.convert(event.deltaY, event.deltaMode));

        event.stopImmediatePropagation();
    }

    // AS3: .../ChatHistoryScrollView.as::endScrollWheel()
    private endScrollWheel(startSpringback: boolean = true): void
    {
        if(this._smoothScroller === null || !this._smoothScroller.isScrolling) return;

        this._smoothScroller.stop();

        if(startSpringback && !this._isDragging) this.startSpringbackIfNeeded();
    }

    // AS3: .../ChatHistoryScrollView.as::onWheelScrollCompleted()
    private onWheelScrollCompleted(): void
    {
        if(!this._isDragging) this.startSpringbackIfNeeded();
    }

    // AS3: .../ChatHistoryScrollView.as::onEntrySpriteClicked()
    private onEntrySpriteClicked(sprite: BitmapSpriteWithUserId): void
    {
        this._chatFlow.selectAvatar(sprite.roomId, sprite.userIndex);
    }

    /**
     * Parks the ignore button next to the clicked row, or takes it away when that row cannot be
     * ignored — a bot, yourself, or somebody already on the list.
     */
    // AS3: .../ChatHistoryScrollView.as::moveIgnore()
    private moveIgnore(sprite: BitmapSpriteWithUserId): void
    {
        if(this._rootDisplayObject === null || this._ignore === null || sprite === this._ignoreTarget) return;

        if(!sprite.canIgnore || sprite.webId < 0 || (this._chatFlow.sessionDataManager?.isIgnored(sprite.webId) ?? false))
        {
            if(this._ignoreTarget !== null)
            {
                this._rootDisplayObject.removeChild(this._ignore);
                this._ignoreTarget = null;
            }

            return;
        }

        this._ignore.x = sprite.x + sprite.width + 5;
        this._ignore.y = sprite.y + (sprite.height - this._ignore.height) / 2;

        this._rootDisplayObject.addChild(this._ignore);
        this._ignoreTarget = sprite;
    }

    // AS3: .../ChatHistoryScrollView.as::hitIgnore()
    private hitIgnore(x: number, y: number): boolean
    {
        const ignore = this._ignore;
        const target = this._ignoreTarget;

        if(ignore === null || target === null) return false;
        if(x < ignore.x || x > ignore.x + ignore.width || y < ignore.y || y > ignore.y + ignore.height) return false;

        const localizations = this._chatFlow.localizations;

        localizations?.registerParameter('chat.ignore_user.confirm.info', 'username', target.userName);

        const title = localizations?.getLocalization('chat.ignore_user.confirm.title') ?? '';
        const info = localizations?.getLocalization('chat.ignore_user.confirm.info') ?? '';

        this._chatFlow.windowManager?.confirmWithModal(title, info, 0, (dialog, event) =>
        {
            this.ignoreConfirmDialogEventProcessor(dialog, event);
        });

        return true;
    }

    // AS3: .../ChatHistoryScrollView.as::ignoreConfirmDialogEventProcessor()
    private ignoreConfirmDialogEventProcessor(dialog: IDisposable, event: WindowEvent): void
    {
        dialog.dispose();

        if(event.type === WindowEvent.WE_OK && this._ignoreTarget !== null)
        {
            this._chatFlow.sessionDataManager?.ignoreUser(this._ignoreTarget.webId);
        }

        if(this._ignoreTarget !== null)
        {
            if(this._ignore !== null) this._rootDisplayObject?.removeChild(this._ignore);

            this._ignoreTarget = null;
        }
    }

    // AS3: .../ChatHistoryScrollView.as::cancelSpringback()
    private cancelSpringback(): void
    {
        this._springbackActive = false;
        this._springbackElapsedMs = 0;
        this._springbackStartTopY = this._topY;
        this._springbackTargetTopY = this._topY;
    }

    // AS3: .../ChatHistoryScrollView.as::cancelAutoScrollToLatest()
    private cancelAutoScrollToLatest(): void
    {
        this._autoScrollActive = false;
        this._autoScrollElapsedMs = 0;
        this._autoScrollStartTopY = this._topY;
        this._autoScrollTargetTopY = this._topY;
    }

    // AS3: .../ChatHistoryScrollView.as::startAutoScrollToLatest()
    private startAutoScrollToLatest(): void
    {
        if(this._viewPort === null) return;

        this.cancelSpringback();

        const target = this.bufferHeight - this._viewPort.height + this._bottomPadding;

        if(target === this._topY)
        {
            this.cancelAutoScrollToLatest();

            return;
        }

        this._autoScrollActive = true;
        this._autoScrollStartTopY = this._topY;
        this._autoScrollTargetTopY = target;
        this._autoScrollElapsedMs = 0;
    }

    // AS3: .../ChatHistoryScrollView.as::syncMostRecentHistoryMode()
    private syncMostRecentHistoryMode(): void
    {
        if(this.isViewingMostRecentChatsWithBuffer())
        {
            this._mostRecentHistoryMode = true;
            this._bottomPadding = this.getCurrentBottomPadding();
        }
        else
        {
            this._mostRecentHistoryMode = false;
        }
    }

    // AS3: .../ChatHistoryScrollView.as::getCurrentBottomPadding()
    private getCurrentBottomPadding(): number
    {
        if(this._viewPort === null) return 0;

        return this._topY - this.bufferHeight + this._viewPort.height;
    }

    // AS3: .../ChatHistoryScrollView.as::isViewingMostRecentChatsWithBuffer()
    private isViewingMostRecentChatsWithBuffer(): boolean
    {
        return this._viewPort !== null
			&& this.getCurrentBottomPadding() >= ChatHistoryScrollView.MOST_RECENT_HISTORY_BOTTOM_PADDING_THRESHOLD;
    }

    /**
     * Where an over-scroll should land, or NaN when the view is already in range.
     *
     * Both margins are capped at the buffer's own height, so a scrollback shorter than 200px
     * springs back to itself rather than off the end.
     */
    // AS3: .../ChatHistoryScrollView.as::getSpringbackTargetTopY()
    private getSpringbackTargetTopY(): number
    {
        if(this._viewPort === null || this.bufferHeight <= 0) return NaN;

        const topMargin = Math.min(ChatHistoryScrollView.TOP_SPRINGBACK_MARGIN, this.bufferHeight);
        const bottomMargin = Math.min(ChatHistoryScrollView.BOTTOM_SPRINGBACK_MARGIN, this.bufferHeight);

        if(topMargin <= 0 && bottomMargin <= 0) return NaN;

        if(topMargin > 0)
        {
            const highest = topMargin - this._viewPort.height;

            if(this._topY < highest) return highest;
        }

        if(bottomMargin > 0)
        {
            const lowest = this.bufferHeight - bottomMargin;

            if(this._topY > lowest) return lowest;
        }

        return NaN;
    }

    // AS3: .../ChatHistoryScrollView.as::dispose()
    dispose(): void
    {
        this.deactivateScrolling();
        this.deactivateView();
        this.stopScrollWheel();

        if(typeof window !== 'undefined') window.removeEventListener('resize', this.onWindowResized);

        this._clipMask = null;
        this._ignore = null;
        this._ignoreTarget = null;

        if(this._smoothScroller !== null)
        {
            this._smoothScroller.dispose();
            this._smoothScroller = null;
        }

        if(this._rootDisplayObject !== null)
        {
            this._rootDisplayObject.mask = null;
            this._rootDisplayObject.destroy({children: true});
            this._rootDisplayObject = null;
        }

        this._inputSurface = null;
    }
}
