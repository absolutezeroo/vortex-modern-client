import {Container, Graphics, Sprite, Texture} from 'pixi.js';
import {AssetBitmap} from '@core/assets/AssetBitmap';
import type {IDisposable, IUpdateReceiver} from '@core/runtime';
import type {HabboFreeFlowChat} from '../../HabboFreeFlowChat';
import type {ChatHistoryScrollView} from './ChatHistoryScrollView';
import {ChatHistoryVisualizationEnum} from './enum/ChatHistoryVisualizationEnum';

/**
 * The drag-out chat history: a dark column that slides in from the left edge of the room, with the
 * scrollback inside it and a handle on its right edge to pull it open and shut.
 *
 * It owns the animation and the room's mouse blocking; the scrolling belongs to
 * `ChatHistoryScrollView`, which this only ticks while the tray is open or moving. It is also the
 * only update receiver of the pair — the view registers for nothing.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/ChatHistoryTray.as
 */
export class ChatHistoryTray implements IDisposable, IUpdateReceiver
{
    // AS3: .../ChatHistoryTray.as::ANIMATION_DURATION_MS
    private static readonly ANIMATION_DURATION_MS: number = 140;
    // AS3: .../ChatHistoryTray.as::ROOM_MOUSE_BLOCK_HANDLE_ID
    private static readonly ROOM_MOUSE_BLOCK_HANDLE_ID: string = 'freeflow_chat_history_handle';

    /**
     * The dark backdrop, `0xA224231E` as an ARGB literal in AS3 — a 1x1 `BitmapData` stretched to
     * the tray. PixiJS tints `Texture.WHITE` instead, which is the same pixel with no allocation.
     */
    // AS3: .../ChatHistoryTray.as::_bg
    private static readonly BACKGROUND_COLOR: number = 0x24231E;
    // AS3: .../ChatHistoryTray.as::_bg
    private static readonly BACKGROUND_ALPHA: number = 0xA2 / 0xFF;

    // AS3: .../ChatHistoryTray.as::_rootDisplayObject
    private _rootDisplayObject: Container | null = new Container();
    // AS3: .../ChatHistoryTray.as::_tab
    private readonly _tab: Container = new Container();
    // AS3: .../ChatHistoryTray.as::_trayBar
    private readonly _trayBar: Sprite;
    // AS3: .../ChatHistoryTray.as::_handle
    private readonly _handle: Sprite;
    // AS3: .../ChatHistoryTray.as::_tabHandleHitArea
    private readonly _tabHandleHitArea: Graphics = new Graphics();
    // AS3: .../ChatHistoryTray.as::_bg
    private readonly _bg: Sprite = new Sprite(Texture.WHITE);
    // AS3: .../ChatHistoryTray.as::_openedWidth
    private readonly _openedWidth: number;
    // AS3: .../ChatHistoryTray.as::_currentWidth
    private _currentWidth: number = 0;
    // AS3: .../ChatHistoryTray.as::_isOpen
    private _isOpen: boolean = false;
    // AS3: .../ChatHistoryTray.as::_isAnimating
    private _isAnimating: boolean = false;
    // AS3: .../ChatHistoryTray.as::_isRegisteredForUpdates
    private _isRegisteredForUpdates: boolean = false;
    // AS3: .../ChatHistoryTray.as::_hasOpenedInRoom
    private _hasOpenedInRoom: boolean = false;
    // AS3: .../ChatHistoryTray.as::_wasFollowingLatestWhenClosed
    private _wasFollowingLatestWhenClosed: boolean = false;
    // AS3: .../ChatHistoryTray.as::_animationStartWidth
    private _animationStartWidth: number = 0;
    // AS3: .../ChatHistoryTray.as::_animationTargetWidth
    private _animationTargetWidth: number = 0;
    // AS3: .../ChatHistoryTray.as::_animationElapsedMs
    private _animationElapsedMs: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/ChatHistoryTray.as::ChatHistoryTray()
    constructor(private readonly _chatFlow: HabboFreeFlowChat, private readonly _scrollView: ChatHistoryScrollView)
    {
        const root = this._rootDisplayObject as Container;

        this._trayBar = ChatHistoryTray.createBitmapSprite(_chatFlow, 'tray_bar');
        this._trayBar.height = 0;
        this._trayBar.x = -this._trayBar.texture.width;

        this._handle = ChatHistoryTray.createBitmapSprite(_chatFlow, 'tray_handle_open');
        this._handle.x = ChatHistoryVisualizationEnum.TRAY_HANDLE_INLET_LEFT;
        this._handle.y = 350;
        this._handle.visible = false;

        this._tabHandleHitArea.visible = false;
        this._tabHandleHitArea.eventMode = 'static';
        this._tabHandleHitArea.cursor = 'pointer';
        this._tabHandleHitArea.on('pointertap', this.onTabHandleClicked, this);
        this.refreshTabHandleHitArea();

        this._tab.addChild(this._trayBar, this._handle, this._tabHandleHitArea);
        root.addChild(this._tab);

        this._bg.tint = ChatHistoryTray.BACKGROUND_COLOR;
        this._bg.alpha = ChatHistoryTray.BACKGROUND_ALPHA;
        this._bg.width = 0;
        this._bg.height = 0;
        root.addChild(this._bg);

        // AS3's literal `350 + 62 + 1`: the widest row plus the timestamp column plus the 1px the
        // tray bar overlaps it by. Only the middle term has a name.
        this._openedWidth = 350 + ChatHistoryVisualizationEnum.TIMESTAMP_FIXED_WIDTH + 1;

        // AS3 does this from `addedToStage`, which fires the moment ChatViewController parents this
        // container; ChatViewController owns the resize event afterwards, exactly as it does there.
        if(typeof window !== 'undefined') this.resize(window.innerWidth, window.innerHeight);

        this.applyTrayWidth(0);
    }

    // TS-only: the two `getAssetByName(...).content` reads AS3 writes out longhand.
    private static createBitmapSprite(chatFlow: HabboFreeFlowChat, assetName: string): Sprite
    {
        const bitmap = AssetBitmap.resolveSync(chatFlow.assets?.getAssetByName(assetName)?.content ?? null);

        return new Sprite(bitmap === null ? Texture.EMPTY : Texture.from(bitmap));
    }

    // AS3: .../ChatHistoryTray.as::get disposed()
    get disposed(): boolean
    {
        return this._rootDisplayObject === null;
    }

    // AS3: .../ChatHistoryTray.as::get rootDisplayObject()
    get rootDisplayObject(): Container | null
    {
        return this._rootDisplayObject;
    }

    /** Follows the room's height, minus the strip the toolbar sits in. */
    // AS3: .../ChatHistoryTray.as::resize()
    resize(_width: number, height: number): void
    {
        // AS3 also writes `_tab.height`, then resets `_tab.scaleY` to 1 two lines later, which
        // undoes it — a Flash-only round trip with no net effect, and no equivalent here.
        const columnHeight = height - ChatHistoryVisualizationEnum.TRAY_TOOLBAR_BOTTOM_MARGIN;

        this._trayBar.height = columnHeight;
        this._bg.height = columnHeight;
        this._handle.y = height - ChatHistoryVisualizationEnum.TRAY_HANDLE_OFFSET_FROM_BOTTOM;

        this.applyTrayWidth(Math.round(this._currentWidth));
    }

    // AS3: .../ChatHistoryTray.as::toggleHistoryVisibility()
    toggleHistoryVisibility(): void
    {
        if(this._rootDisplayObject === null) return;

        if(this._isOpen) this.startClosing();
        else this.startOpening();
    }

    // AS3: .../ChatHistoryTray.as::set visible()
    set visible(value: boolean)
    {
        if(this._isOpen !== value) this.toggleHistoryVisibility();
    }

    /**
     * Ticks the scroll view whenever the tray is on screen, then advances the slide.
     *
     * The width eases cubically out over 140ms; landing on 0 is what finally detaches the view.
     */
    // AS3: .../ChatHistoryTray.as::update()
    update(deltaMs: number): void
    {
        if(this._isOpen || this._isAnimating) this._scrollView.update(deltaMs);

        if(this._isAnimating)
        {
            this._animationElapsedMs += deltaMs;

            const progress = Math.min(1, this._animationElapsedMs / ChatHistoryTray.ANIMATION_DURATION_MS);
            const eased = 1 - Math.pow(1 - progress, 3);

            this.applyTrayWidth(Math.round(this._animationStartWidth + (this._animationTargetWidth - this._animationStartWidth) * eased));

            if(progress >= 1)
            {
                this._isAnimating = false;
                this.applyTrayWidth(this._animationTargetWidth);

                if(this._animationTargetWidth === 0) this.finishClosing();
            }
        }

        this.refreshUpdateRegistration();
    }

    // AS3: .../ChatHistoryTray.as::tabHandleClickedEventHandler()
    private onTabHandleClicked(): void
    {
        if(this._tabHandleHitArea.visible) this.toggleHistoryVisibility();
    }

    /**
     * Attaches the scroll view, rebuilds its rows, and slides out.
     *
     * The jump to the bottom only happens the first time the tray is opened in this room, or when
     * it was following the newest chat at the moment it was last closed — reopening after scrolling
     * back leaves you where you were.
     */
    // AS3: .../ChatHistoryTray.as::startOpening()
    private startOpening(): void
    {
        this._isOpen = true;

        const viewRoot = this._scrollView.rootDisplayObject;

        if(viewRoot !== null && viewRoot.parent !== this._rootDisplayObject) this._rootDisplayObject?.addChild(viewRoot);

        if(!this._scrollView.isActive)
        {
            if(!this._hasOpenedInRoom || this._wasFollowingLatestWhenClosed) this._scrollView.scrollToBottom();

            this._scrollView.activateView();
            this._hasOpenedInRoom = true;
        }

        this._scrollView.activateScrolling();
        this.setHandleTexture('tray_handle_close');

        if(this.shouldAnimate())
        {
            this.beginWidthAnimation(this._openedWidth);
        }
        else
        {
            this._isAnimating = false;
            this.applyTrayWidth(this._openedWidth);
            this.refreshUpdateRegistration();
        }
    }

    // AS3: .../ChatHistoryTray.as::startClosing()
    private startClosing(): void
    {
        this._isOpen = false;
        this._wasFollowingLatestWhenClosed = this._scrollView.isMostRecentHistoryMode;

        this._scrollView.deactivateScrolling();

        if(this.shouldAnimate())
        {
            this.beginWidthAnimation(0);
        }
        else
        {
            this._isAnimating = false;
            this.applyTrayWidth(0);
            this.finishClosing();
            this.refreshUpdateRegistration();
        }
    }

    // AS3: .../ChatHistoryTray.as::finishClosing()
    private finishClosing(): void
    {
        const viewRoot = this._scrollView.rootDisplayObject;

        if(viewRoot !== null && viewRoot.parent === this._rootDisplayObject) this._rootDisplayObject?.removeChild(viewRoot);

        this._scrollView.deactivateView();
        this.setHandleTexture('tray_handle_open');

        this._handle.visible = false;
        this._tabHandleHitArea.visible = false;

        this.refreshTabHandleHitArea();
    }

    // TS-only: AS3 reassigns `_handle.bitmapData` from the asset library at both call sites.
    private setHandleTexture(assetName: string): void
    {
        const bitmap = AssetBitmap.resolveSync(this._chatFlow.assets?.getAssetByName(assetName)?.content ?? null);

        if(bitmap !== null) this._handle.texture = Texture.from(bitmap);
    }

    // AS3: .../ChatHistoryTray.as::beginWidthAnimation()
    private beginWidthAnimation(targetWidth: number): void
    {
        this._animationStartWidth = this._currentWidth;
        this._animationTargetWidth = targetWidth;
        this._animationElapsedMs = 0;

        if(this._animationStartWidth === this._animationTargetWidth)
        {
            this._isAnimating = false;
            this.applyTrayWidth(targetWidth);

            if(targetWidth === 0) this.finishClosing();

            this.refreshUpdateRegistration();

            return;
        }

        this._isAnimating = true;
        this.refreshUpdateRegistration();
    }

    /**
     * The one place the tray's width is written. Everything positional hangs off it: the bar and
     * the handle ride the tray's right edge, the handle and its hit area only exist while the tray
     * is open at all, and the room stops taking clicks left of the bar.
     */
    // AS3: .../ChatHistoryTray.as::applyTrayWidth()
    private applyTrayWidth(width: number): void
    {
        const clamped = Math.max(0, Math.min(this._openedWidth, width));
        const barWidth = this._trayBar.texture.width;

        this._currentWidth = clamped;
        this._bg.width = clamped;
        this._trayBar.x = clamped > 0 ? clamped : -barWidth;
        this._handle.x = clamped > 0
            ? clamped - ChatHistoryVisualizationEnum.TRAY_HANDLE_INLET_LEFT + barWidth
            : -ChatHistoryVisualizationEnum.TRAY_HANDLE_INLET_LEFT;
        this._handle.visible = clamped > 0;
        this._tabHandleHitArea.visible = clamped > 0;

        this._scrollView.viewWidth = clamped;

        this.refreshTabHandleHitArea();

        this._chatFlow.disableRoomMouseEventsLeftOfX(clamped > 0 ? clamped + barWidth : 0);
        this.updateRoomMouseBlockRect();
    }

    /**
     * Only ticks while there is something to tick. AS3 registers at priority 1, above the room but
     * below communication.
     */
    // AS3: .../ChatHistoryTray.as::refreshUpdateRegistration()
    private refreshUpdateRegistration(): void
    {
        const wanted = this._isOpen || this._isAnimating;

        if(wanted === this._isRegisteredForUpdates) return;

        if(wanted) this._chatFlow.registerUpdateReceiver(this, 1);
        else this._chatFlow.removeUpdateReceiver(this);

        this._isRegisteredForUpdates = wanted;
    }

    /**
     * DEVIATION: AS3 asks whether it is on the Flash stage. PixiJS has no such flag, so this asks
     *   whether the tray has been parented — which is the same question here, since the only thing
     *   that ever parents it is `ChatViewController`, and that container goes straight onto the
     *   room's stage. Before that (the `applyTrayWidth(0)` in the constructor) there is nothing to
     *   animate anyway.
     */
    // DEVIATION: see the block above.
    // AS3: .../ChatHistoryTray.as::shouldAnimate()
    private shouldAnimate(): boolean
    {
        return this._rootDisplayObject !== null && this._rootDisplayObject.parent !== null;
    }

    // AS3: .../ChatHistoryTray.as::refreshTabHandleHitArea()
    private refreshTabHandleHitArea(): void
    {
        this._tabHandleHitArea.x = this._handle.x;
        this._tabHandleHitArea.y = this._handle.y;

        this._tabHandleHitArea.clear();
        this._tabHandleHitArea.rect(0, 0, this._handle.width, this._handle.height).fill({color: 0, alpha: 0});
    }

    /**
     * The handle overlaps the room, so the room engine is told not to read mouse events under it —
     * otherwise pulling the tray open also clicks whatever tile is behind the handle.
     */
    // AS3: .../ChatHistoryTray.as::updateRoomMouseBlockRect()
    private updateRoomMouseBlockRect(): void
    {
        if(this._chatFlow.roomEngine === null || !this._tabHandleHitArea.visible || !this.shouldAnimate())
        {
            this.removeRoomMouseBlockRect();

            return;
        }

        const bounds = this._tabHandleHitArea.getBounds();

        if(bounds.width <= 0 || bounds.height <= 0)
        {
            this.removeRoomMouseBlockRect();

            return;
        }

        this._chatFlow.roomEngine.setMouseEventsDisabledRect(ChatHistoryTray.ROOM_MOUSE_BLOCK_HANDLE_ID, {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
        });
    }

    // AS3: .../ChatHistoryTray.as::removeRoomMouseBlockRect()
    private removeRoomMouseBlockRect(): void
    {
        this._chatFlow.roomEngine?.removeMouseEventsDisabledRect(ChatHistoryTray.ROOM_MOUSE_BLOCK_HANDLE_ID);
    }

    // AS3: .../ChatHistoryTray.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        this._chatFlow.disableRoomMouseEventsLeftOfX(0);
        this.removeRoomMouseBlockRect();

        this._scrollView.deactivateScrolling();
        this._tabHandleHitArea.off('pointertap', this.onTabHandleClicked, this);

        if(this._isRegisteredForUpdates) this._chatFlow.removeUpdateReceiver(this);

        this._isAnimating = false;
        this._isRegisteredForUpdates = false;

        // The scroll view is a child while the tray is open and disposes itself right after this
        // (`HabboFreeFlowChat.roomLeft()` takes the tray first), so it has to come out before the
        // recursive destroy — AS3 never destroys anything here and so never had to think about it.
        const viewRoot = this._scrollView.rootDisplayObject;

        if(viewRoot !== null && viewRoot.parent === this._rootDisplayObject) this._rootDisplayObject?.removeChild(viewRoot);

        this._rootDisplayObject?.destroy({children: true});
        this._rootDisplayObject = null;
    }
}
