import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {UserHabbiconStatusChangedMessageParser} from '@habbo/communication/messages/parser/habbicons/UserHabbiconStatusChangedMessageParser';

/**
 * One habbicon gained, lost, or (un)favourited. Header 2019, from WIN63's own registry.
 *
 * **The name is DERIVED, not recovered.** Habbicons exist in no other tree — `win63_version`
 * predates them, PRODUCTION is a 2016 build — and vortex-emulator carries no habbicon header at
 * all, so there is nothing to corroborate against. It is named for what the controller's
 * `onUserHabbiconStatusChanged()` does with it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1920/_SafeCls_3736.as
 */
export class UserHabbiconStatusChangedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, UserHabbiconStatusChangedMessageParser);
    }
}
