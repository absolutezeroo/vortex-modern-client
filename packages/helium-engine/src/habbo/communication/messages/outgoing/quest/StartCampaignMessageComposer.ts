import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Starts a campaign by its code.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/quest/StartCampaignMessageComposer.as
 */
export class StartCampaignMessageComposer extends MessageComposer<ConstructorParameters<typeof StartCampaignMessageComposer>>
{
	private _data: ConstructorParameters<typeof StartCampaignMessageComposer>;

	constructor(campaignCode: string)
	{
		super();
		this._data = [campaignCode];
	}

	getMessageArray()
	{
		return this._data;
	}
}
