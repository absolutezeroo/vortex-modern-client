import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the list of pending calls for help.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/help/GetPendingCallsForHelpMessageComposer.as
 */
export class GetPendingCallsForHelpMessageComposer extends MessageComposer<[]>
{
    getMessageArray(): []
    {
        return [];
    }
}
