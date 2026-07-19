import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    CompetitionVotingInfoMessageEventParser
} from '../../parser/competition/CompetitionVotingInfoMessageEventParser';

/**
 * Event for competition voting info message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/competition/CompetitionVotingInfoMessageEvent.as
 */
export class CompetitionVotingInfoMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CompetitionVotingInfoMessageEventParser);
    }
}
