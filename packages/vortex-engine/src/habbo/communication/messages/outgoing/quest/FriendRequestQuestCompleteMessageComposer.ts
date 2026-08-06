import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Notifies the server that the friend request quest has been completed.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/quest/FriendRequestQuestCompleteMessageComposer.as
 */
export class FriendRequestQuestCompleteMessageComposer extends MessageComposer<[]>
{
    // AS3: sources/win63_version/habbo/communication/messages/outgoing/quest/FriendRequestQuestCompleteMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
