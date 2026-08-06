import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the concurrent users reward from the server.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/quest/GetConcurrentUsersRewardMessageComposer.as
 */
export class GetConcurrentUsersRewardMessageComposer extends MessageComposer<[]>
{
    // AS3: sources/win63_version/habbo/communication/messages/outgoing/quest/GetConcurrentUsersRewardMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
