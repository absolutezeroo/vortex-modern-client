import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CfhSanctionMessageParser} from '@habbo/communication/messages/parser/moderation/CfhSanctionMessageParser';

/**
 * AS3: sources/win63_version/habbo/communication/messages/incoming/callforhelp/CfhSanctionMessageEvent.as
 * (`_SafeCls_2679` in the primary tree; header 1634 from its registry)
 */
export class CfhSanctionMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CfhSanctionMessageParser);
    }
}
