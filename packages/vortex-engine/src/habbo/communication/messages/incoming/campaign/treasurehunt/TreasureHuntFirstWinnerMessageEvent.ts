import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    TreasureHuntFirstWinnerMessageEventParser
} from '../../../parser/campaign/treasurehunt/TreasureHuntFirstWinnerMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/campaign/treasurehunt/TreasureHuntFirstWinnerMessageEvent.as
 */
export class TreasureHuntFirstWinnerMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, TreasureHuntFirstWinnerMessageEventParser);
    }
}
