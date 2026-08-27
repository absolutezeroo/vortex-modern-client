import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    TreasureHuntFailMessageEventParser
} from '../../../parser/campaign/treasurehunt/TreasureHuntFailMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/campaign/treasurehunt/TreasureHuntFailMessageEvent.as
 */
export class TreasureHuntFailMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, TreasureHuntFailMessageEventParser);
    }
}
