import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Cancels a guide session from the requester side.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/help/GuideSessionRequesterCancelsMessageComposer.as
 */
export class GuideSessionRequesterCancelsMessageComposer extends MessageComposer<[]>
{
    // AS3: sources/win63_version/habbo/communication/messages/outgoing/help/GuideSessionRequesterCancelsMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
