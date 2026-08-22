import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';

import {RoomChatSettingsMessageParser} from '../../parser/roomsettings/RoomChatSettingsMessageParser';

/**
 * The room's chat flood sensitivity changed — header 594 in WIN63's registry
 * (`_SafeCls_2046.as::_events[594]`).
 *
 * `HabboFreeFlowChat` is its only subscriber: the sensitivity feeds the effective chat settings
 * the chat flow reads, and the room settings dialog is what makes the server send it.
 *
 * Name RECOVERED from `vortex-emulator`'s `RoomChatSettingsMessageComposer`, which is what sends
 * this header; the class is obfuscated in the primary tree and has no readable filename in
 * `win63_version` either.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2213/_SafeCls_2212.as
 */
export class RoomChatSettingsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RoomChatSettingsMessageParser);
    }
}
