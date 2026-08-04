import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomSettingsErrorMessageEventParser} from '../../parser/navigator/RoomSettingsErrorMessageEventParser';

/**
 * RoomSettingsErrorMessageEvent (header 3715)
 *
 * A room-settings error. Like `NoSuchFlat`, AS3 registers it and leaves the handler
 * body empty - it reads the parser into a local and discards it.
 *
 * Name recovered from the emulator's `RoomSettingsErrorComposer = 3715`; the AS3 class
 * is obfuscated in every available tree. Both members are recovered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1710/_SafeCls_3682.as
 */
export class RoomSettingsErrorMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RoomSettingsErrorMessageEventParser);
    }
}
