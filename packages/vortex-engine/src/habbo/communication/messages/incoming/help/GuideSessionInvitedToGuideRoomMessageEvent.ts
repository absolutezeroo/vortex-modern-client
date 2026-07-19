import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    GuideSessionInvitedToGuideRoomMessageParser
} from '../../parser/help/GuideSessionInvitedToGuideRoomMessageParser';

/**
 * Event for being invited to a guide's room during a session.
 * Fired when the requester is invited to the guide's room.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/help/GuideSessionInvitedToGuideRoomMessageEvent.as
 */
export class GuideSessionInvitedToGuideRoomMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GuideSessionInvitedToGuideRoomMessageParser);
    }
}
