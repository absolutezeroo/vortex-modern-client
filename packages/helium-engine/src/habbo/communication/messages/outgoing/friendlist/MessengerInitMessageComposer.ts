import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests messenger initialization data (friend limits, categories).
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/friendlist/MessengerInitMessageComposer.as
 */
export class MessengerInitMessageComposer extends MessageComposer<[]>
{
	getMessageArray(): []
	{
		return [];
	}
}
