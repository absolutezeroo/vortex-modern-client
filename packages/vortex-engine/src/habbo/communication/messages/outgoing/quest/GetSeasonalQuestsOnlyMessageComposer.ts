import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the list of seasonal quests only from the server.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/quest/GetSeasonalQuestsOnlyMessageComposer.as
 */
export class GetSeasonalQuestsOnlyMessageComposer extends MessageComposer<[]>
{
    // AS3: sources/win63_version/habbo/communication/messages/outgoing/quest/GetSeasonalQuestsOnlyMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
