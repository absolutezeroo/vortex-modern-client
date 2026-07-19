import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GuideSessionInviteRequesterMessageParser} from '../../parser/help/GuideSessionInviteRequesterMessageParser';

/**
 * Event for guide session invite requester notification.
 * Fired when the guide invites the requester to a room.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/help/GuideSessionInvitedToGuideRoomMessageEvent.as
 */
export class GuideSessionInviteRequesterMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GuideSessionInviteRequesterMessageParser);
    }
}
