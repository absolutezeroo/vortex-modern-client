import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Marks a guide session as resolved.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/help/GuideSessionResolvedMessageComposer.as
 */
export class GuideSessionResolvedMessageComposer extends MessageComposer<[]>
{
    // AS3: sources/win63_version/habbo/communication/messages/outgoing/help/GuideSessionResolvedMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
