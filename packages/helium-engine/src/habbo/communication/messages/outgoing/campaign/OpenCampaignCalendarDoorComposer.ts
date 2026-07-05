import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Request to open a campaign calendar door (as regular user)
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/campaign/OpenCampaignCalendarDoorComposer.as
 */
export class OpenCampaignCalendarDoorComposer extends MessageComposer<ConstructorParameters<typeof OpenCampaignCalendarDoorComposer>>
{
    private _data: ConstructorParameters<typeof OpenCampaignCalendarDoorComposer>;

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
