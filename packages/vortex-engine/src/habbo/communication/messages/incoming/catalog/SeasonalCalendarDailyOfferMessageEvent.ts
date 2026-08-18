import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    SeasonalCalendarDailyOfferMessageEventParser
} from '../../parser/catalog/SeasonalCalendarDailyOfferMessageEventParser';
import type {ClubOfferData} from '../../parser/catalog/ClubOfferData';

/**
 * Today's seasonal-calendar offer. Header 1641, from WIN63's own registry
 * (`_SafeStr_4546[1641] = _SafeCls_2647`).
 *
 * Name from `sources/win63_version/habbo/communication/messages/incoming/catalog/
 * SeasonalCalendarDailyOfferMessageEvent.as`, corroborated by the emulator's header table.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/_SafeCls_2647.as
 */
export class SeasonalCalendarDailyOfferMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_2647.as::_SafeCls_2647()
    constructor(callback: MessageEventCallback)
    {
        super(callback, SeasonalCalendarDailyOfferMessageEventParser);
    }

    // AS3: _SafeCls_2647.as::get offer()
    get offer(): ClubOfferData | null
    {
        return (this._parser as SeasonalCalendarDailyOfferMessageEventParser).offerData;
    }

    // AS3: _SafeCls_2647.as::get pageId()
    get pageId(): number
    {
        return (this._parser as SeasonalCalendarDailyOfferMessageEventParser).pageId;
    }
}
