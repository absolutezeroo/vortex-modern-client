import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends a message to a friend via the messenger console.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/friendlist/SendMsgMessageComposer.as
 */
export class SendMsgMessageComposer extends MessageComposer<ConstructorParameters<typeof SendMsgMessageComposer>>
{
	private _data: ConstructorParameters<typeof SendMsgMessageComposer>;

	constructor(recipientId: number, message: string, clientMessageId: number)
	{
		super();
		this._data = [recipientId, message, clientMessageId];
	}

	getMessageArray()
	{
		return this._data;
	}
}
