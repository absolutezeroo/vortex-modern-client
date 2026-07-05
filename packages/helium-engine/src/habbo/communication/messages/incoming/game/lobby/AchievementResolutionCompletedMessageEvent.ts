import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    AchievementResolutionCompletedMessageEventParser
} from '../../../parser/game/lobby/AchievementResolutionCompletedMessageEventParser';

/**
 * Event for the achievement resolution completed message.
 * Fired when a resolution achievement is completed, containing badge and stuff codes.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/game/lobby/AchievementResolutionCompletedMessageEvent.as
 */
export class AchievementResolutionCompletedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, AchievementResolutionCompletedMessageEventParser);
    }
}
