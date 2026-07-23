import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {WiredMenuSettingsParser} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/WiredMenuSettingsParser';

/**
 * WiredMenuSettingsEvent — incoming wired-menu settings (WIN63 header 491): the modify/read permission
 * masks + timezone for the settings tab.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3408`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2538/_SafeCls_3408.as
 */
export class WiredMenuSettingsEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredMenuSettingsParser);
    }
}
