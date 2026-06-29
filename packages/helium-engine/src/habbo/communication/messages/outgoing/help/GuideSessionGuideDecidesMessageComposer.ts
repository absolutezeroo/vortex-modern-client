import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends the guide's decision to accept or reject a help request.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/help/GuideSessionGuideDecidesMessageComposer.as
 */
export class GuideSessionGuideDecidesMessageComposer extends MessageComposer<ConstructorParameters<typeof GuideSessionGuideDecidesMessageComposer>>
{
	private _data: ConstructorParameters<typeof GuideSessionGuideDecidesMessageComposer>;

	constructor(accepted: boolean)
	{
		super();
		this._data = [accepted];
	}

	getMessageArray()
	{
		return this._data;
	}
}
