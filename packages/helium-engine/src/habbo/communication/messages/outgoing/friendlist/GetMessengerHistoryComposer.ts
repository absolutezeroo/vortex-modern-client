import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests conversation history for a given chat.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/friendlist/GetMessengerHistoryComposer.as
 */
export class GetMessengerHistoryComposer extends MessageComposer<ConstructorParameters<typeof GetMessengerHistoryComposer>>
{
	private _data: ConstructorParameters<typeof GetMessengerHistoryComposer>;

	constructor(chatId: number, messageId: string)
	{
		super();
		this._data = [chatId, messageId];
	}

	getMessageArray()
	{
		return this._data;
	}
}
