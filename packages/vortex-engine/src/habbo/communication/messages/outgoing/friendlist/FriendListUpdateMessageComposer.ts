import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests a friend list update from the server.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/friendlist/FriendListUpdateMessageComposer.as
 */
export class FriendListUpdateMessageComposer extends MessageComposer<[]>
{
    // AS3: sources/win63_version/habbo/communication/messages/outgoing/friendlist/FriendListUpdateMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
