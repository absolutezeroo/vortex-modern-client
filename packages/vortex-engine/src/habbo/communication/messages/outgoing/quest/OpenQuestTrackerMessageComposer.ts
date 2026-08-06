import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Notifies the server that the quest tracker has been opened.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/quest/OpenQuestTrackerMessageComposer.as
 */
export class OpenQuestTrackerMessageComposer extends MessageComposer<[]>
{
    // AS3: sources/win63_version/habbo/communication/messages/outgoing/quest/OpenQuestTrackerMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
