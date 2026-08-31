import {Container, Rectangle, type FederatedPointerEvent, type NineSliceSprite} from 'pixi.js';
import {AssetBitmap} from '@core/assets/AssetBitmap';
import {Logger} from '@core/utils/Logger';
import {HabboFreeFlowChat} from '../../HabboFreeFlowChat';
import type {ChatHistoryScrollView} from './ChatHistoryScrollView';

const log = Logger.getLogger('habbo.freeflowchat.history.ChatHistoryScrollBar');

/**
 * The tray's scroll bar: a nine-sliced track with a nine-sliced thumb on it.
 *
 * It owns no scroll position of its own — the thumb is drawn from the view's `topY` against the
 * buffer's total height, and dragging it writes `topY` straight back.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/ChatHistoryScrollBar.as
 */
export class ChatHistoryScrollBar
{
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/ChatHistoryScrollBar.as::RIGHT_MARGIN
    public static readonly RIGHT_MARGIN: number = 0;

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/ChatHistoryScrollBar.as::_displayObject
    private readonly _displayObject: Container = new Container();
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/ChatHistoryScrollBar.as::_background
    private readonly _background: NineSliceSprite | null;
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/ChatHistoryScrollBar.as::_thumb
    private readonly _thumb: NineSliceSprite | null;
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/ChatHistoryScrollBar.as::_dragStartY
    private _dragStartY: number = 0;
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/ChatHistoryScrollBar.as::_dragStartTopY
    private _dragStartTopY: number = 0;

    /**
     * DEVIATION: AS3 subscribes to `stage.mouseMove`/`mouseUp` for the duration of the drag and
     *   unsubscribes on release. PixiJS's `globalpointermove` already fires regardless of hit test,
     *   and `pointerupoutside` catches a release off the thumb, so the two listeners are permanent
     *   and this flag is what the AS3 subscription was.
     */
    // DEVIATION: see the block above.
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/ChatHistoryScrollBar.as::mouseDownEventHandler()
    private _dragging: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/ChatHistoryScrollBar.as::ChatHistoryScrollBar()
    constructor(private readonly _scrollView: ChatHistoryScrollView, chatFlow: HabboFreeFlowChat)
    {
        this._thumb = ChatHistoryScrollBar.createSlice(chatFlow, 'scrollbar_thumb', new Rectangle(2, 2, 1, 1));
        this._background = ChatHistoryScrollBar.createSlice(chatFlow, 'scrollbar_back', new Rectangle(2, 2, 5, 5));

        if(this._background !== null) this._displayObject.addChild(this._background);

        if(this._thumb !== null)
        {
            this._thumb.x = 2;
            this._thumb.y = 2;
            this._thumb.eventMode = 'static';
            this._thumb.cursor = 'pointer';
            this._thumb.on('pointerdown', this.onPointerDown, this);
            this._thumb.on('globalpointermove', this.onPointerMove, this);
            this._thumb.on('pointerup', this.onPointerUp, this);
            this._thumb.on('pointerupoutside', this.onPointerUp, this);

            this._displayObject.addChild(this._thumb);
        }
    }

    // TS-only: AS3 inlines both `create9SliceSprite(...)` calls; the asset lookup is the same twice.
    private static createSlice(chatFlow: HabboFreeFlowChat, assetName: string, scale9Grid: Rectangle): NineSliceSprite | null
    {
        const bitmap = AssetBitmap.resolveSync(chatFlow.assets?.getAssetByName(assetName)?.content ?? null);

        if(bitmap === null)
        {
            log.warn(`Missing chat-history scroll bar asset "${assetName}" — the bar renders nothing.`);

            return null;
        }

        return HabboFreeFlowChat.createNineSliceSprite(scale9Grid, bitmap) as NineSliceSprite;
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/ChatHistoryScrollBar.as::get displayObject()
    get displayObject(): Container
    {
        return this._displayObject;
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/ChatHistoryScrollBar.as::set height()
    set height(value: number)
    {
        if(this._background !== null) this._background.height = value;

        this.updateThumbTrack();
    }

    /**
     * Sizes the thumb to the fraction of the buffer on screen and puts it where `topY` says.
     *
     * With nothing in the buffer the thumb fills the track — the bar is drawn, but there is nothing
     * to scroll.
     */
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/ChatHistoryScrollBar.as::updateThumbTrack()
    updateThumbTrack(): void
    {
        if(this._background === null || this._thumb === null) return;

        const trackHeight = this._background.height;
        const bufferHeight = this._scrollView.bufferHeight;
        const viewPort = this._scrollView.viewPort;

        if(bufferHeight <= 0 || viewPort === null)
        {
            this._thumb.height = Math.max(5, trackHeight - 4);
            this._thumb.y = 2;

            return;
        }

        const scrolled = this._scrollView.topY + (viewPort.height - trackHeight);

        this._thumb.height = Math.min(trackHeight - 4, Math.max(5, Math.trunc((trackHeight - 4) * (trackHeight / bufferHeight))));
        this._thumb.y = Math.min(
            trackHeight - 2 - this._thumb.height,
            Math.max(2, Math.trunc((trackHeight - 4) * (Math.max(1, scrolled) / bufferHeight) - this._thumb.height / 2))
        );
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/ChatHistoryScrollBar.as::mouseDownEventHandler()
    private onPointerDown(event: FederatedPointerEvent): void
    {
        this._dragStartY = event.global.y;
        this._dragStartTopY = this._scrollView.topY;
        this._dragging = true;

        this._scrollView.beginUserScrollInteraction();

        event.stopImmediatePropagation();
    }

    /**
     * The thumb moves one track-pixel per `bufferHeight / trackHeight` pixels of content, so the
     * pointer delta is scaled by that ratio before it becomes a `topY`.
     */
    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/ChatHistoryScrollBar.as::mouseDragEventHandler()
    private onPointerMove(event: FederatedPointerEvent): void
    {
        if(!this._dragging || this._background === null) return;

        const ratio = this._scrollView.bufferHeight / this._background.height;

        this._scrollView.topY = this._dragStartTopY + Math.trunc((event.global.y - this._dragStartY) * ratio);

        event.stopImmediatePropagation();
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/ChatHistoryScrollBar.as::mouseDragEventHandler()
    private onPointerUp(event: FederatedPointerEvent): void
    {
        if(!this._dragging) return;

        this.endScroll();

        event.stopImmediatePropagation();
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/ChatHistoryScrollBar.as::endScroll()
    endScroll(): void
    {
        this.cancelScroll();
        this._scrollView.startSpringbackIfNeeded();
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/ChatHistoryScrollBar.as::cancelScroll()
    cancelScroll(): void
    {
        this._dragging = false;
    }
}
