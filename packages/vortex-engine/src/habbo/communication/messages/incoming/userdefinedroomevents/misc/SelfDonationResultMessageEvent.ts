import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    SelfDonationResultMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/misc/SelfDonationResultMessageParser';

/**
 * The outcome of a sandbox self-donation — header 3407 in WIN63's registry
 * (`_SafeCls_2046.as::_events[3407]`), where the class kept its real name through obfuscation.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2482/SelfDonationResultMessageEvent.as
 */
export class SelfDonationResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, SelfDonationResultMessageParser);
    }
}
