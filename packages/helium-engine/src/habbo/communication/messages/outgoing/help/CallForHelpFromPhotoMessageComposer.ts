import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends a call for help report from a photo.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/help/CallForHelpFromPhotoMessageComposer.as
 */
export class CallForHelpFromPhotoMessageComposer extends MessageComposer<ConstructorParameters<typeof CallForHelpFromPhotoMessageComposer>>
{
	private _data: ConstructorParameters<typeof CallForHelpFromPhotoMessageComposer>;

	constructor(message: string, topicId: number, reportedUserId: number, roomId: number, photoItemId: number)
	{
		super();
		this._data = [message, topicId, reportedUserId, roomId, photoItemId];
	}

	getMessageArray()
	{
		return this._data;
	}
}
