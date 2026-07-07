import {Container} from 'pixi.js';
import type {IHabboFreeFlowChat} from '@habbo/freeflowchat/IHabboFreeFlowChat';
import type {ChatItem} from '@habbo/freeflowchat/data/ChatItem';
import type {IChatStyleInternal} from './style/IChatStyleInternal';

/**
 * PooledChatBubble
 *
 * TODO(AS3): PooledChatBubble.as is a 618-line `Sprite` subclass that builds
 * the actual visible chat bubble — background nine-slice (via
 * `style.getNewBackgroundSprite()`), text field layout/HTML rendering,
 * pointer, emblem, width-limiting/wrapping, and pooled reuse via
 * `recreate()`. That's the "chat display widget" visual work tracked as
 * not-started in docs/IMPLEMENTATION_STATUS.md.
 *
 * This stub only carries the data ChatBubbleFactory assigns (`chatItem`,
 * `style`, `face`) so the factory has a real, compatible type to construct
 * and pool — `recreate()` intentionally does nothing yet.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/PooledChatBubble.as
 */
export class PooledChatBubble extends Container
{
    private _chatFlow: IHabboFreeFlowChat | null;
    private _chatItem: ChatItem | null = null;
    private _style: IChatStyleInternal | null = null;
    private _face: ImageBitmap | null = null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/PooledChatBubble.as::PooledChatBubble()
    constructor(chatFlow: IHabboFreeFlowChat)
    {
        super();

        this._chatFlow = chatFlow;
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

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/PooledChatBubble.as::recreate()
    // TODO(AS3): see class header — visual (re)construction not ported.
    recreate(_userName: string, _color: number, _borderLimited: boolean = false, _extra: number = -1): void
    {
    }

    get chatFlow(): IHabboFreeFlowChat | null
    {
        return this._chatFlow;
    }
}
