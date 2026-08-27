import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    TreasureHuntUpdateMessageEventParser
} from '../../../parser/campaign/treasurehunt/TreasureHuntUpdateMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/campaign/treasurehunt/TreasureHuntUpdateMessageEvent.as
 */
export class TreasureHuntUpdateMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, TreasureHuntUpdateMessageEventParser);
    }
}
