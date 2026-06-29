import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Notifies the server that the friend request quest has been completed.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/quest/FriendRequestQuestCompleteMessageComposer.as
 */
export class FriendRequestQuestCompleteMessageComposer extends MessageComposer<[]>
{
	getMessageArray(): []
	{
		return [];
	}
}
