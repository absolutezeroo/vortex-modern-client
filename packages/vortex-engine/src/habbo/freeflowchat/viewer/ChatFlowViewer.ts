import {Container} from 'pixi.js';
import type {IDisposable, IUpdateReceiver} from '@core/runtime';
import type {IHabboFreeFlowChat} from '@habbo/freeflowchat/IHabboFreeFlowChat';
import type {ChatFlowStage} from './simulation/ChatFlowStage';
import type {PooledChatBubble} from './visualization/PooledChatBubble';

const VIEW_BOTTOM_DEFAULT = 230;
/** AS3: ChatFlowViewer.as::_SafeStr_10384 (view-bottom as a fraction of stage height) */
const VIEW_BOTTOM_RATIO = 0.25;

/**
 * ChatFlowViewer
 *
 * Owns the root display container every live chat bubble is added to, and
 * drives each bubble's per-frame tween/pointer-tracking update + recycling
 * once it's flagged `readyToRecycle`.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatFlowViewer.as
 */
export class ChatFlowViewer implements IUpdateReceiver, IDisposable
{
    private _chatFlow: IHabboFreeFlowChat | null;
    private readonly _chatFlowStage: ChatFlowStage;
    private readonly _rootDisplayObject: Container = new Container();
    private readonly _bubbles: PooledChatBubble[] = [];

    private _lastRoomId: number = 0;
    private _lastRoomPanOffsetX: number = 0;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatFlowViewer.as::ChatFlowViewer()
    constructor(chatFlow: IHabboFreeFlowChat, chatFlowStage: ChatFlowStage)
    {
        this._chatFlow = chatFlow;
        this._chatFlowStage = chatFlowStage;
        chatFlow.registerUpdateReceiver(this, 1);
    }

    get disposed(): boolean
    {
        return this._rootDisplayObject === null || this._chatFlow === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatFlowViewer.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        this._chatFlow?.removeUpdateReceiver(this);
        this._chatFlow = null;
        this._bubbles.length = 0;
        this._rootDisplayObject.destroy({children: true});
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatFlowViewer.as::insertBubble()
    insertBubble(bubble: PooledChatBubble, point: {x: number; y: number}): void
    {
        const chatFlow = this._chatFlow;

        if(!chatFlow?.roomEngine) return;

        const offset = chatFlow.roomEngine.getRoomCanvasScreenOffset(bubble.roomId);

        bubble.roomPanOffsetX = offset?.x ?? 0;
        this._lastRoomPanOffsetX = bubble.roomPanOffsetX;

        this._bubbles.push(bubble);
        this._rootDisplayObject.addChild(bubble);
        bubble.warpTo(point.x, point.y);
        bubble.repositionPointer();
        this._lastRoomId = bubble.roomId;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatFlowViewer.as::update()
    update(deltaMs: number): void
    {
        const chatFlow = this._chatFlow;

        if(!chatFlow?.roomEngine) return;

        const offset = chatFlow.roomEngine.getRoomCanvasScreenOffset(this._lastRoomId);

        if(offset)
        {
            if(offset.x !== this._lastRoomPanOffsetX && this._bubbles.length > 0)
            {
                for(const bubble of this._bubbles) bubble.roomPanOffsetX = offset.x;
            }

            this._lastRoomPanOffsetX = offset.x;
        }

        const toRemove: PooledChatBubble[] = [];

        for(const bubble of this._bubbles)
        {
            bubble.update(deltaMs);

            if(bubble.readyToRecycle) toRemove.push(bubble);
        }

        if(toRemove.length > 0)
        {
            for(const bubble of toRemove)
            {
                this._rootDisplayObject.removeChild(bubble);

                const index = this._bubbles.indexOf(bubble);

                if(index !== -1) this._bubbles.splice(index, 1);

                bubble.unregister();
                chatFlow.chatBubbleFactory?.recycle(bubble);
            }
        }
    }

    get rootDisplayObject(): Container
    {
        return this._rootDisplayObject;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatFlowViewer.as::get viewBottom()
    get viewBottom(): number
    {
        const stageHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

        return stageHeight > 0 ? stageHeight * VIEW_BOTTOM_RATIO : VIEW_BOTTOM_DEFAULT;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatFlowViewer.as::resize()
    resize(width: number, height: number): void
    {
        this._chatFlowStage.resize(width, height);
    }
}
