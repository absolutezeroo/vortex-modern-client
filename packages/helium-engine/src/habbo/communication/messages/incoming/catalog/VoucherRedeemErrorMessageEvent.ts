import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {VoucherRedeemErrorMessageEventParser} from '../../parser/catalog/VoucherRedeemErrorMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/VoucherRedeemErrorMessageEvent.as
 */
export class VoucherRedeemErrorMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, VoucherRedeemErrorMessageEventParser);
    }
}
