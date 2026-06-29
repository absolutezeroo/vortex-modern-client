import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests to find new friends (random room matching).
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/friendlist/FindNewFriendsMessageComposer.as
 */
export class FindNewFriendsMessageComposer extends MessageComposer<[]>
{
	getMessageArray(): []
	{
		return [];
	}
}
