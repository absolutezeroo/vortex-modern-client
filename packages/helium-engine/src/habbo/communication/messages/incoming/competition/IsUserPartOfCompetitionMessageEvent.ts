import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {IsUserPartOfCompetitionMessageEventParser} from '../../parser/competition/IsUserPartOfCompetitionMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/competition/IsUserPartOfCompetitionMessageEvent.as
 */
export class IsUserPartOfCompetitionMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, IsUserPartOfCompetitionMessageEventParser);
    }
}
