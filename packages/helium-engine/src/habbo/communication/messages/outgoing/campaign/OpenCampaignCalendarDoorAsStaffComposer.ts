import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Request to force-open a campaign calendar door (as staff)
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/campaign/OpenCampaignCalendarDoorAsStaffComposer.as
 */
export class OpenCampaignCalendarDoorAsStaffComposer extends MessageComposer<ConstructorParameters<typeof OpenCampaignCalendarDoorAsStaffComposer>>
{
	private _data: ConstructorParameters<typeof OpenCampaignCalendarDoorAsStaffComposer>;

	constructor(campaignName: string, dayIndex: number)
	{
		super();
		this._data = [campaignName, dayIndex];
	}

	getMessageArray()
	{
		return this._data;
	}
}
