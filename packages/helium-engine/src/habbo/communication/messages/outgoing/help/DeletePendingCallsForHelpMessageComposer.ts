import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Deletes all pending calls for help.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/help/DeletePendingCallsForHelpMessageComposer.as
 */
export class DeletePendingCallsForHelpMessageComposer extends MessageComposer<[]>
{
    getMessageArray(): []
    {
        return [];
    }
}
