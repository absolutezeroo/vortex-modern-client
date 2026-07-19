import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CommunityVoteReceivedEventParser} from '../../../parser/landingview/votes/CommunityVoteReceivedEventParser';

/**
 * Fired when the server acknowledges a community-goal vote.
 *
 * Registered in HabboMessages.ts with header id 551, matching
 * sources/win63_version (see CommunityGoalVoteMessageComposer.ts for the
 * broader rationale on reusing win63_version's real header ids here).
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/landingview/votes/CommunityVoteReceivedEvent.as
 */
export class CommunityVoteReceivedEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CommunityVoteReceivedEventParser);
    }
}
