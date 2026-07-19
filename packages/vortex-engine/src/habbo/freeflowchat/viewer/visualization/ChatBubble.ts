import type {Rectangle} from 'pixi.js';
import {Vortex} from '../../../../Vortex';
import type {IHabboFreeFlowChat} from '@habbo/freeflowchat/IHabboFreeFlowChat';
import type {ChatItem} from '@habbo/freeflowchat/data/ChatItem';
import type {IChatStyleInternal} from './style/IChatStyleInternal';
import {PooledChatBubble} from './PooledChatBubble';

/**
 * ChatBubble
 *
 * A single-use chat bubble, rasterized once to an ImageBitmap for the chat
 * history scrollback log (ChatBubbleFactory.getHistoryLineEntry()) - unlike
 * PooledChatBubble, which stays live in the room and is reused across
 * messages, this one is drawn once and thrown away.
 *
 * AS3's ChatBubble.as and PooledChatBubble.as independently implement the
 * exact same ~250-line composition algorithm (confirmed while reading both -
 * PooledChatBubble.recreate()'s body is byte-for-byte the same steps as
 * ChatBubble's constructor, just restructured for reuse). Rather than
 * maintain that duplication twice in TS, this class builds its one-shot
 * bubble through an internal PooledChatBubble and rasterizes that - same
 * visual result, one composition implementation to keep correct.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/ChatBubble.as
 */
export class ChatBubble
{
    private _bubble: PooledChatBubble | null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/ChatBubble.as::ChatBubble()
    constructor(
        item: ChatItem,
        style: IChatStyleInternal,
        face: ImageBitmap | null,
        userName: string,
        color: number,
        chatFlow: IHabboFreeFlowChat,
        forcedWidth: number = -1
    )
    {
        const bubble = new PooledChatBubble(chatFlow);

        bubble.chatItem = item;
        bubble.style = style;
        bubble.face = face;
        bubble.recreate(userName, color, false, forcedWidth === 1 ? 1 : -1);
        // recreate() starts bubbles invisible pending their entrance tween (see
        // PooledChatBubble.ts) - this one-shot instance is never added to the live
        // scene/ticker, so it must be forced visible to rasterize correctly.
        bubble.visible = true;

        this._bubble = bubble;
    }

    get width(): number
    {
        return this._bubble?.width ?? 0;
    }

    get height(): number
    {
        return this._bubble?.height ?? 0;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/ChatBubble.as::drawToBitmap()
    // TS note: AS3's `bitmapData.draw(this)` is synchronous; the web equivalent
    // (renderer.extract.canvas() + createImageBitmap()) needs a microtask for the
    // final decode, so this is async - see ChatBubbleFactory.getHistoryLineEntry(),
    // which already has no synchronous callers to break.
    async toImageBitmap(): Promise<ImageBitmap | null>
    {
        if(!this._bubble) return null;

        const canvas = Vortex.instance.application.renderer.extract.canvas(this._bubble);

        return createImageBitmap(canvas as unknown as CanvasImageSource);
    }

    get overlap(): Rectangle | null
    {
        return this._bubble?.overlap ?? null;
    }

    dispose(): void
    {
        if(!this._bubble) return;

        this._bubble.unregister();
        this._bubble.destroy();
        this._bubble = null;
    }
}
