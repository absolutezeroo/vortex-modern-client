import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Cancels the currently active quest.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/quest/CancelQuestMessageComposer.as
 */
export class CancelQuestMessageComposer extends MessageComposer<[]>
{
    // AS3: sources/win63_version/habbo/communication/messages/outgoing/quest/CancelQuestMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
