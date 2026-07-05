import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    AchievementResolutionsMessageEventParser
} from '../../../parser/game/lobby/AchievementResolutionsMessageEventParser';

/**
 * Event for the achievement resolutions list message.
 * Contains a list of resolution achievements with a stuff ID and end time.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/game/lobby/AchievementResolutionsMessageEvent.as
 */
export class AchievementResolutionsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, AchievementResolutionsMessageEventParser);
    }
}
