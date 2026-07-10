import type {IDisposable, IUpdateReceiver} from '@core/runtime';
import type {IHabboFreeFlowChat} from '@habbo/freeflowchat/IHabboFreeFlowChat';
import type {PooledChatBubble} from '../visualization/PooledChatBubble';

/** AS3: ChatFlowStage.as::MOVE_UP_AMOUNT_PIXELS */
export const MOVE_UP_AMOUNT_PIXELS = 19;
/** AS3: ChatFlowStage.as::MOVE_UP_TIMER_DEFAULT - pixels/ms so movement is deltaMs-smooth. */
const SCROLL_SPEED_PX_PER_MS = MOVE_UP_AMOUNT_PIXELS / 10000;
const CLEANUP_OFFSCREEN_Y = -10;

/**
 * ChatFlowStage
 *
 * TODO(AS3): this is an intentionally minimal placeholder for the real AS3
 * physics engine (gravity toward the speaker, AABB collision resolution
 * between simultaneously-visible bubbles, line-by-line mode, desktop-margin
 * full-height collision) - none of `ChatBubbleSimulationEntity`,
 * `ChatBubbleSimulationWithLimitedWideRect`, `ChatBubbleCollisionEvent`, or
 * the gravity helper (`_SafeCls_2911`) are ported yet. This version places
 * each bubble directly above its speaker and scrolls everything upward at a
 * constant rate; concurrent bubbles from different speakers can visually
 * overlap. Deferred to a follow-up plan - see docs/IMPLEMENTATION_STATUS.md.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatFlowStage.as
 */
export class ChatFlowStage implements IUpdateReceiver, IDisposable
{
    private _chatFlow: IHabboFreeFlowChat | null;
    private readonly _bubbles: PooledChatBubble[] = [];
    private _viewBottom: number = 0;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatFlowStage.as::ChatFlowStage()
    constructor(chatFlow: IHabboFreeFlowChat)
    {
        this._chatFlow = chatFlow;
    }

    get disposed(): boolean
    {
        return this._chatFlow === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatFlowStage.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        this._bubbles.length = 0;
        this._chatFlow = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatFlowStage.as::insertBubble()
    // TODO(AS3): no gravity-toward-existing-bubbles relaxation (AS3 lines 126-164) - see
    // class header. Returns the point directly above the speaker every time.
    insertBubble(bubble: PooledChatBubble): {x: number; y: number}
    {
        const chatFlow = this._chatFlow;

        if(!chatFlow?.chatFlowViewer) return {x: 0, y: 0};

        if(this._viewBottom === 0) this._viewBottom = chatFlow.chatFlowViewer.viewBottom;

        const offset = chatFlow.roomEngine?.getRoomCanvasScreenOffset(bubble.roomId) ?? null;

        bubble.roomPanOffsetX = offset?.x ?? 0;

        const overlap = bubble.overlap;
        const point = {
            x: bubble.userScreenPos.x - bubble.width / 2 - (offset?.x ?? 0) - (overlap?.x ?? 0),
            y: chatFlow.chatFlowViewer.viewBottom - (overlap?.y ?? 0)
        };

        this._bubbles.push(bubble);

        return point;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatFlowStage.as::update()
    // Folds in AS3's separate cleanup() (own 5000ms-throttled pass, here just done inline
    // every tick since this class no longer has cleanup()'s O(bubbles^2) collision work to
    // amortize around) - drops bubbles this stage no longer needs to keep scrolling once
    // ChatFlowViewer has flagged/recycled them, so this list doesn't grow unbounded.
    update(deltaMs: number): void
    {
        const scrollAmount = SCROLL_SPEED_PX_PER_MS * deltaMs;

        for(const bubble of this._bubbles)
        {
            if(bubble.readyToRecycle) continue;

            bubble.moveTo(bubble.proxyX, bubble.y - scrollAmount);

            if(bubble.y < CLEANUP_OFFSCREEN_Y) bubble.readyToRecycle = true;
        }

        for(let i = this._bubbles.length - 1; i >= 0; i--)
        {
            if(this._bubbles[i].readyToRecycle) this._bubbles.splice(i, 1);
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatFlowStage.as::clear()
    clear(): void
    {
        for(const bubble of this._bubbles) bubble.readyToRecycle = true;

        this.update(0);
        this._chatFlow?.chatFlowViewer?.update(0);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatFlowStage.as::resize()
    resize(_width: number, _height: number): void
    {
        const chatFlow = this._chatFlow;

        if(!chatFlow?.chatFlowViewer) return;

        const viewBottom = chatFlow.chatFlowViewer.viewBottom;

        if(this._viewBottom !== viewBottom)
        {
            const delta = viewBottom - this._viewBottom;

            for(const bubble of this._bubbles) bubble.warpTo(bubble.proxyX, bubble.y + delta);
        }

        this._viewBottom = viewBottom;
    }
}
