import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {IncomeRewardClaimResponseMessageParser} from '@habbo/communication/messages/parser/inventory/IncomeRewardClaimResponseMessageParser';

/**
 * Name RECOVERED from vortex-emulator's IncomeRewardClaimResponseMessageComposer, whose id matches
 * WIN63's registry.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3664/
 */
export class IncomeRewardClaimResponseMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, IncomeRewardClaimResponseMessageParser);
    }
}
