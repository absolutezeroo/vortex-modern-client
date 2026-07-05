import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ChatReviewSessionVotingStatusMessageParser} from '../../parser/help/ChatReviewSessionVotingStatusMessageParser';

/**
 * Event fired when chat review session voting status is received.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/help/ChatReviewSessionVotingStatusMessageEvent.as
 */
export class ChatReviewSessionVotingStatusMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: MessageEventCallback)
    {
        super(callBack, ChatReviewSessionVotingStatusMessageParser);
    }
}
