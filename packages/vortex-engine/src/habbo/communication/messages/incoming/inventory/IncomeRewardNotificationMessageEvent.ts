import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {IncomeRewardNotificationMessageParser} from '@habbo/communication/messages/parser/inventory/IncomeRewardNotificationMessageParser';

/**
 * Name RECOVERED from vortex-emulator's IncomeRewardNotificationMessageComposer, whose id matches
 * WIN63's registry.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3664/
 */
export class IncomeRewardNotificationMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, IncomeRewardNotificationMessageParser);
    }
}
