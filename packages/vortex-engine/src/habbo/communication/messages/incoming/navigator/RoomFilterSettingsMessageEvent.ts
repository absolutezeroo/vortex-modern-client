import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomFilterSettingsMessageEventParser} from '../../parser/navigator/RoomFilterSettingsMessageEventParser';

/**
 * RoomFilterSettingsMessageEvent (header 3208)
 *
 * The room's word-filter list, which fills `RoomFilterCtrl`.
 *
 * Name recovered from the emulator's `RoomFilterSettingsMessageComposer = 3208`; the
 * AS3 class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2213/_SafeCls_2846.as
 */
export class RoomFilterSettingsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RoomFilterSettingsMessageEventParser);
    }
}
