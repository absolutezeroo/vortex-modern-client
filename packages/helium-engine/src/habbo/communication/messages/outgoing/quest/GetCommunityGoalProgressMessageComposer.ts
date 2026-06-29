import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the community goal progress from the server.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/quest/GetCommunityGoalProgressMessageComposer.as
 */
export class GetCommunityGoalProgressMessageComposer extends MessageComposer<[]>
{
	getMessageArray(): []
	{
		return [];
	}
}
