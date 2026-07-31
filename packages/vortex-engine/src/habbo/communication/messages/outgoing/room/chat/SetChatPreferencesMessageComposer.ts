import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Persist the room-chat display preferences.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_2255.as
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::sendChatPreferences()
 *
 * Header 1149, from WIN63's registry (`_SafeCls_2046.as::_composers[1149]`). Corroborated by
 * vortex-emulator's `SetChatPreferencesMessageEvent = 1149`, itself annotated
 * "AS3-verified: HabboFreeFlowChat::sendChatPreferences()".
 *
 * These three travel together and are only ever sent from `updateChatPreferences()`, which
 * sanitises all three, drops the send entirely if none changed, and refreshes the view first.
 * The per-property setters (`chatMode`, `chatBubbleWidth`, `chatScrollSpeed`) each route through
 * it with the other two unchanged — there is no setter that sends on its own.
 *
 * Not to be confused with `_SafeCls_2257` (2634), which carries the *chat style* and font-size
 * mode from `preferedChatStyle`/`chatFontSizeMode`.
 *
 * The name comes from vortex-emulator; no unobfuscated tree carries this composer.
 */
export class SetChatPreferencesMessageComposer extends MessageComposer<[number, number, number]>
{
    private _data: [number, number, number];

    constructor(chatMode: number, chatBubbleWidth: number, chatScrollSpeed: number)
    {
        super();
        this._data = [chatMode, chatBubbleWidth, chatScrollSpeed];
    }

    getMessageArray(): [number, number, number]
    {
        return this._data;
    }
}
