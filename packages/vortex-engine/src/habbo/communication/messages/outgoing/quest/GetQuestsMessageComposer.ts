import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the full list of quests from the server.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/quest/GetQuestsMessageComposer.as
 */
export class GetQuestsMessageComposer extends MessageComposer<[]>
{
    // AS3: sources/win63_version/habbo/communication/messages/outgoing/quest/GetQuestsMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
