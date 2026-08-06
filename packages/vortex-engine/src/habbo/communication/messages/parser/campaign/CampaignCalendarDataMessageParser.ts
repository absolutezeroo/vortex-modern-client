import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {CampaignCalendarData} from './CampaignCalendarData';

/**
 * Parser for campaign calendar data messages
 *
 * @see source_as_win63/habbo/communication/messages/parser/campaign/CampaignCalendarDataMessageEventParser.as
 */
export class CampaignCalendarDataMessageParser implements IMessageParser
{
    private _data: CampaignCalendarData | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/campaign/CampaignCalendarDataMessageEventParser.as::flush()
    flush(): boolean
    {
        this._data = null;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/campaign/CampaignCalendarDataMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._data = new CampaignCalendarData();
        this._data.parse(wrapper);
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/campaign/CampaignCalendarDataMessageEventParser.as::cloneData()
    cloneData(): CampaignCalendarData | null
    {
        return this._data ? this._data.clone() : null;
    }
}
