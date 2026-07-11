import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {VoucherRedeemOkMessageEventParser} from '../../parser/catalog/VoucherRedeemOkMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/VoucherRedeemOkMessageEvent.as
 */
export class VoucherRedeemOkMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, VoucherRedeemOkMessageEventParser);
    }
}
