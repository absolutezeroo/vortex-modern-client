import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the list of pending friend requests.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/friendlist/GetFriendRequestsMessageComposer.as
 */
export class GetFriendRequestsMessageComposer extends MessageComposer<[]>
{
    getMessageArray(): []
    {
        return [];
    }
}
