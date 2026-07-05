import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {AchievementEventParser} from '../../../parser/inventory/achievements/AchievementEventParser';

/**
 * Event for receiving a single achievement update.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/achievements/AchievementEvent.as
 */
export class AchievementMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, AchievementEventParser);
    }
}
