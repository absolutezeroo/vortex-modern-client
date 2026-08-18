import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {ClubOfferData} from './ClubOfferData';

/**
 * The one catalog offer behind today's seasonal-calendar door.
 *
 * Name from `sources/win63_version/habbo/communication/messages/parser/catalog/
 * SeasonalCalendarDailyOfferMessageEventParser.as`, corroborated by the emulator's
 * `SeasonalCalendarDailyOfferMessageComposer = 1641`.
 *
 * The offer is the **full** catalog shape (`ClubOfferData`), not the shorter one `PurchaseOK`
 * sends — the emulator keeps both as `CatalogOfferSerializer.Serialize()` and
 * `SerializeAsPurchased()`, and only the first carries `priceInSilver` and `previewImage`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_4309.as
 */
export class SeasonalCalendarDailyOfferMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_4309.as::_SafeStr_7494
    private _pageId: number = -1;

    // AS3: _SafeCls_4309.as::_SafeStr_7963
    private _offerData: ClubOfferData | null = null;

    // AS3: _SafeCls_4309.as::get pageId()
    get pageId(): number
    {
        return this._pageId;
    }

    // AS3: _SafeCls_4309.as::get offerData()
    get offerData(): ClubOfferData | null
    {
        return this._offerData;
    }

    // AS3: _SafeCls_4309.as::flush()
    flush(): boolean
    {
        this._pageId = -1;
        this._offerData = null;

        return true;
    }

    // AS3: _SafeCls_4309.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._pageId = wrapper.readInt();
        this._offerData = new ClubOfferData(wrapper);

        return true;
    }
}
