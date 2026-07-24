import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {WiredRoomLogsParser} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/WiredRoomLogsParser';

/**
 * WiredRoomLogsMessageEvent — incoming page of wired room-logs for the room-log list sub-controller
 * (WIN63 header 1910).
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3729`, `src/unknowns/_SafePkg_3730/`); named
 * for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3730/_SafeCls_3729.as
 */
export class WiredRoomLogsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredRoomLogsParser);
    }
}
