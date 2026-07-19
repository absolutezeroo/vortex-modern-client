import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ModeratorToolPreferencesParser} from '../../parser/moderation/ModeratorToolPreferencesParser';

/**
 * Event for moderator tool window preferences.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/ModeratorToolPreferencesEvent.as
 */
export class ModeratorToolPreferencesMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, ModeratorToolPreferencesParser);
    }
}
