import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends a call for help report from a selfie/photo.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/help/CallForHelpFromSelfieMessageComposer.as
 */
export class CallForHelpFromSelfieMessageComposer extends MessageComposer<ConstructorParameters<typeof CallForHelpFromSelfieMessageComposer>>
{
	private _data: ConstructorParameters<typeof CallForHelpFromSelfieMessageComposer>;

	constructor(message: string, topicId: number, reportedUserId: number, photoId: string, roomId: number)
	{
		super();
		this._data = [message, topicId, reportedUserId, photoId, roomId];
	}

	getMessageArray()
	{
		return this._data;
	}
}
