import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NoOwnedRoomsAlertMessageEventParser} from '../../parser/navigator/NoOwnedRoomsAlertMessageEventParser';

/**
 * NoOwnedRoomsAlertMessageEvent (header 735)
 *
 * The player has no room of their own. Carries no payload - it exists only to open
 * the room-creation flow.
 *
 * Name recovered from the emulator's `NoOwnedRoomsAlertMessageComposer = 735`; the AS3
 * class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2435/_SafeCls_3164.as
 */
export class NoOwnedRoomsAlertMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, NoOwnedRoomsAlertMessageEventParser);
    }
}
