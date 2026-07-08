import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CurrentTimingCodeMessageEventParser} from '../../parser/competition/CurrentTimingCodeMessageEventParser';

/**
 * Fired with the currently-active scheduled campaign code for a given
 * `landing.view.dynamic.slot.N.conf` schedule string.
 *
 * Registered in HabboMessages.ts with header id 1179, matching
 * sources/win63_version (see CommunityGoalVoteMessageComposer.ts for the
 * broader rationale on reusing win63_version's real header ids here).
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/competition/CurrentTimingCodeMessageEvent.as
 */
export class CurrentTimingCodeMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CurrentTimingCodeMessageEventParser);
    }
}
