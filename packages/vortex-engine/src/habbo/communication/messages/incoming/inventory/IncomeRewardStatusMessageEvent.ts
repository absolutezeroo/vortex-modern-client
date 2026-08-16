import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {IncomeRewardStatusMessageParser} from '@habbo/communication/messages/parser/inventory/IncomeRewardStatusMessageParser';

/**
 * Name RECOVERED from vortex-emulator's IncomeRewardStatusMessageComposer, whose id matches
 * WIN63's registry.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3664/
 */
export class IncomeRewardStatusMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, IncomeRewardStatusMessageParser);
    }
}
