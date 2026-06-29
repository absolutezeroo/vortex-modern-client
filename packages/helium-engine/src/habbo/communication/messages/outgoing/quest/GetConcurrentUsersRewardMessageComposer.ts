import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the concurrent users reward from the server.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/quest/GetConcurrentUsersRewardMessageComposer.as
 */
export class GetConcurrentUsersRewardMessageComposer extends MessageComposer<[]>
{
	getMessageArray(): []
	{
		return [];
	}
}
