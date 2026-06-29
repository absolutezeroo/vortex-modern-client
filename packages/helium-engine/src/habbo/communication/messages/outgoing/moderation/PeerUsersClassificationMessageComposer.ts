import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests user classification data for a peer user.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/userclassification/PeerUsersClassificationMessageComposer.as
 */
export class PeerUsersClassificationMessageComposer extends MessageComposer<ConstructorParameters<typeof PeerUsersClassificationMessageComposer>>
{
	private _data: ConstructorParameters<typeof PeerUsersClassificationMessageComposer>;

	constructor(userName: string)
	{
		super();
		this._data = [userName];
	}

	getMessageArray()
	{
		return this._data;
	}
}
